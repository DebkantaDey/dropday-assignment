# My Design & Architecture Decisions

Here are the choices I made while building this application, answering the questions in the brief.

### 1. What exactly happens on screen when a hold expires?
Instead of just deleting the item from the cart instantly (which would be jarring and confusing), I wanted the change to be clear. When a hold expires:
* The countdown circle swaps to a red "X" badge.
* The ticket card turns red and displays "Hold expired — released back to the pool".
* It stays on the screen for 6 seconds so the user has time to see what happened, then it slides out.
* A red banner notice pops up at the top of the screen to make sure they notice it.

### 2. Client clock vs. API clock & handling drift
The server is the absolute source of truth. The background loop in `lib/server/db.ts` ticks once a second and is what actually expires holds or moves stock back. 
The client-side countdown is just a projection to make the UI tick smoothly at high frame rates. Since the client polls the `/api/holds` endpoint every 2 seconds, any clock drift corrects itself within a couple of seconds.

### 3. Optimistic UI vs. Wait-for-server for holds
I chose **wait-for-server** with a loading state. 
Since stock is highly contested in this simulation, using an optimistic UI (showing "Hold active" before the server confirms it) would lie to the user. If they clicked and we immediately said "Reserved" but the server then rejected it because someone else was faster, it would feel like a bug. Instead, the button displays "Holding..." and disables itself until the backend confirms the hold.

### 4. Why Zustand?
I went with Zustand because this application deals with time-based state updates that run independently of user actions (like holds ticking down, toasts disappearing, and product status polling). 
Using React's Context API would force the entire app to re-render on every tick. Zustand lets components subscribe to very specific pieces of state (e.g., only the individual ticket rerenders when its timer ticks, leaving the rest of the page untouched) without writing complex memoization code.

### 5. Multi-tab behavior
All open tabs share a single session ID stored in `localStorage`. 
Since both tabs poll `/api/holds` (every 2s) and `/api/products` (every 4s) and refetch when the window is focused, they sync automatically. If you reserve an item in Tab A, it will appear in Tab B's cart within two seconds, ensuring the shopper has a single unified cart across their browser.
