# Decisions

## 1. What exactly happens on screen the moment a hold expires?

The hold's ticket in the Holds Panel swaps from its countdown ring to an "expired" state:
a small ✕ badge, a dimmed red-tinted card, and the line "Hold expired — released back to
the pool." It stays visible like that for a few seconds (not deleted instantly) so the
user can register what happened, then quietly drops out of the list. A toast also fires
("Hold on 'X' expired — it's back in the pool.") so the event is visible even if the
panel isn't in view. Nothing disappears silently — every expiry is announced in at least
two places.

## 2. Whose clock is the truth — client or the API layer? How do you handle drift?

The server (`lib/server/db.ts`) is the only authority. `expiresAt` is a timestamp the
server assigns when the hold is created, and a server-side heartbeat (`tick()`, once a
second) is what actually flips a hold from `active` to `expired` and returns stock to the
pool — the client never decides this itself. The client's countdown (`useCountdown`) is a
pure display projection: it renders `expiresAt - Date.now()` locally so the ring ticks
smoothly at 5fps instead of waiting on network round trips. Because the client polls
`/api/holds` every 2s, any drift between the client's guess and the server's actual state
self-corrects within one poll cycle rather than accumulating — if the client's countdown
hits zero a beat before the server confirms it, the UI already shows the expired state
(optimistic), and the next poll just confirms it.

## 3. Optimistic UI or wait-for-server when placing a hold? Why?

Wait-for-server, with a disabled/loading button state in between. Placing a hold is the
one action in this app where being optimistic is actively misleading: the whole premise
of the assignment is that stock is contested, so showing a hold as "yours" before the
server has actually reserved it would mean lying to the user right at the moment they
most need accurate information ("did I get it or not?"). The button shows "Holding…" and
is disabled for that product only (other products stay interactive) until the response
comes back — either the ticket appears in the panel, or a toast explains someone else got
there first. Releasing a hold and checkout, by contrast, are lower-stakes and get the same
wait-for-server treatment mainly for consistency and because both are already fast.

## 4. Zustand vs. Context API — why your pick, for this app specifically?

Zustand. This app has state that changes on a timer independent of any component
re-rendering for other reasons (holds ticking down, products polling every few seconds,
toasts auto-dismissing), plus derived values several unrelated components need
(subtotal, active hold count, pending-hold-per-product). With Context, every one of those
timer-driven updates would re-render the entire provider subtree unless I hand-rolled
memoization or split into several nested providers — for a page-sized app that's more
ceremony than the problem deserves. Zustand's selector subscriptions (`useDropDayStore(s
=> s.products)`) mean a hold ticking down only re-renders `HoldTicket`, not the whole
grid, without extra `useMemo`/`useCallback` scaffolding. It also gives actions a natural
home (`placeHold`, `releaseHold`, `confirmCheckout`) that can call the API layer and
update state in one place, instead of spreading that logic across components with
`useContext` + local `useReducer`.

## 5. What does a user with two open tabs experience?

Both tabs read the same `sessionId` from `localStorage` (generated once, shared by every
tab on that origin), so the server sees them as one shopper. Each tab independently polls
`/api/products` every 4s and `/api/holds` every 2s, plus re-polls on window focus. Practical
effect: place a hold in Tab A, and within about 2 seconds (or immediately on switching to
it) Tab B's Holds Panel shows the same ticket, ticking down from the same `expiresAt`.
Release it in Tab B and Tab A converges the same way. There's a deliberate window (up to
one poll interval) where the two tabs can be slightly out of sync — that's an accepted
trade-off for not building websockets into a 24-hour assignment; the brief doesn't rule
out simulated shoppers taking stock from *this* user either, so eventual consistency in
the few-second range felt honest rather than a shortcut. What the user does *not* get is
two independent carts — there is exactly one cart per browser, by design, matching how a
single real shopper would expect their own tabs to behave.
