# Drop Day

A flash-sale storefront for limited-stock product drops: scheduled releases, 60-second
holds, contested stock, and honest failure states. Frontend-only submission with a real
backend behind the same API boundary (Next.js Route Handlers, in-memory store).

## Setup

```
pnpm install
pnpm dev
```

Open http://localhost:3000. That's it — no env vars, no database, no auth.

> This sandbox has no network access, so dependencies were never installed or built here.
> The code was written directly against Next.js 14 / React 18 / Zustand 4 APIs; run
> `pnpm install` locally to pull the packages before `pnpm dev`.

## Architecture tour

```
app/
  api/                    Route Handlers = the "real backend"
    products/route.ts          GET  list products
    products/[id]/hold/route.ts POST place a 60s hold
    holds/route.ts              GET  list this session's holds
    holds/[id]/route.ts         DELETE release a hold
    checkout/route.ts           POST convert holds -> order
  page.tsx, layout.tsx     Shell
lib/
  api-client.ts           THE API BOUNDARY. Every component calls through
                          `api.*`, never `fetch` directly. Swapping the mock
                          for a real backend means changing BASE_URL here —
                          nothing else in the app changes.
  store.ts                Zustand store. Holds client state, calls `api.*`,
                          reconciles server responses into notices (e.g. "your
                          hold expired").
  server/db.ts            In-memory DB + the simulation heartbeat: promotes
                          scheduled drops, expires holds, lets simulated other
                          shoppers take stock, drifts the hype meter. This is
                          the ONLY place mutable state lives.
  server/simulate.ts      Latency + random-failure injection for route
                          handlers, so the UI has to handle real-world
                          network conditions.
  useCountdown.ts         Client-side ticking hook, purely a display
                          projection — never the source of truth for expiry.
components/
  ProductGrid / ProductCard / StockBar / CountdownChip  Storefront
  HoldsPanel / HoldTicket / CountdownRing               Cart, ticket-stub styled
  CheckoutModal                                         Summary -> confirm -> success/failure
  NoticeStack                                           Toasts for expiry / release / errors
```

### Data flow

Component -> `lib/store.ts` action -> `lib/api-client.ts` -> `/app/api/*` route handler ->
`lib/server/db.ts`. Every layer only knows the layer directly below it. The store never
reaches into `db.ts` and no component ever calls `fetch`.

### Wildcard picked: Hype Meter

Each live product carries a `watchers` count that random-walks every server tick and is
rendered as a small eye-icon badge on the card. It's a lightweight urgency signal that
doesn't gate any functionality — it's cosmetic pressure, same as a real flash-sale site.

### Design system

Light theme, grounded in a ticket-counter / raffle-stub metaphor rather than a generic
dashboard look: cool paper background, serif display face (Fraunces) for product names,
Work Sans for body copy, IBM Plex Mono for anything numeric (prices, countdowns, stock
counts). Product cards carry a punched "tag hole" in the top-left corner as the signature
visual element; the Holds Panel reuses the same ticket vocabulary with perforated edges.
Status color is functional, not decorative: cobalt blue = live/actionable, gold = drops
soon, brick red = danger/expired/sold out — the same three roles carry through badges,
buttons, the stock gauge, and toasts, using [lucide-react](https://lucide.dev) icons
throughout instead of ad-hoc glyphs.

Product photos are pulled from Unsplash by direct CDN URL (`lib/server/db.ts`). Each
`ProductCard` has an `onError` fallback that swaps a broken image for a clean "no photo"
placeholder rather than a broken-image icon, so the storefront still looks intentional if
a particular URL is ever unavailable.

### Known limits (in scope per the brief)

- No auth — a session is a random id in `localStorage`, shared by all tabs on one browser.
- No payments — checkout is a mock success/failure with no charge.
- State is in-memory and resets on server restart (or on Vercel, on cold start / redeploy).
- No automated tests, per the brief's timebox.
