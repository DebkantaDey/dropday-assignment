# Drop Day Storefront

This is my submission for the Frontend Developer Assignment. It is a simulated flash-sale storefront called **Drop Day** where items go live at scheduled times and stock is limited. 

Instead of a standard cart, it uses a **60-second hold timer** for each item. If you do not check out in time, the stock goes back to the public pool and other simulated shoppers can grab it!

## How to Run It

You only need two commands to get the app running locally:

1. `pnpm install` (to install the node packages)
2. `pnpm dev` (to start the Next.js local development server)

Now, just open `http://localhost:3000` in your browser. There is no database setup or environment variables to configure.

## Project Structure & Data Flow

Here is a quick tour of how the code is organized:

*   **`app/`**: Standard Next.js App Router folders. The `app/api/` folder contains real Next.js Route Handlers that act as our backend.
*   **`components/`**: React UI components. The storefront grid is in `ProductGrid`, the cart/holds sidebar is in `HoldsPanel`, and the checkout modal is in `CheckoutModal`.
*   **`lib/api-client.ts`**: The client-side service module. Components and store actions call this module instead of using `fetch` directly. If we want to connect a real production database tomorrow, we only need to change the base URL here.
*   **`lib/store.ts`**: A Zustand store that manages global state (like active holds, toast notifications, and checkout stages).
*   **`lib/server/db.ts`**: An in-memory store that holds our mock database state. It has a background loop (`setInterval` ticking once a second) that updates watchers, simulates other shoppers buying items, and expires active holds.
*   **`lib/server/simulate.ts`**: Helper scripts that inject random latencies (200-1100ms) and network failures into our API routes to make sure our frontend handles real-world conditions robustly.

## Visual Design & Theme

I designed the UI to feel like physical raffle stubs or tickets:
*   A clean, cool gray paper background (`#EEF0F3`) with a subtle grid pattern.
*   **Fraunces** (serif) for bold headlines and product names.
*   **Work Sans** (sans-serif) for readable body text.
*   **IBM Plex Mono** (monospace) for prices, stock units, and timers.
*   The page container is set to **80% screen width** and configured with a high-density **4-column layout** on desktop screens so it feels like a real storefront.

## Wildcards Implemented

I ended up building **two** wildcards:
1.  **Hype Meter**: Product cards display live "watchers" (viewers). This count goes up and down randomly on the server to create visual urgency.
2.  **Panic Mode**: When a hold timer drops below 10 seconds, the ticket turns red and pulses to nudge the user to checkout.
