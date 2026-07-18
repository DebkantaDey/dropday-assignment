import { Product, Hold, Order } from "@/lib/types";

// ---------------------------------------------------------------------------
// This module is the ONLY place that owns mutable state. Route handlers call
// into it; nothing outside /app/api and this file touches `products` or
// `holds` directly. Swap this file for a real DB client and the rest of the
// app — including the client-side service module — does not change.
// ---------------------------------------------------------------------------

const HOLD_DURATION_MS = 60_000;

interface DB {
  products: Map<string, Product>;
  holds: Map<string, Hold>;
  orders: Map<string, Order>;
  seq: number;
  started: boolean;
}

// Survive Next.js dev-server hot reloads by pinning state on globalThis.
const g = globalThis as unknown as { __dropDayDb?: DB };

function seedProducts(): Map<string, Product> {
  const now = Date.now();
  const IMG = "https://images.unsplash.com";
  const q = "?w=900&q=80&auto=format&fit=crop";
  // The accent rotates across four ink colors used for the tag string —
  // status color (live/soon/danger) is applied separately in the UI.
  const COBALT = "#1D3FD1";
  const GOLD = "#B8860B";
  const BRICK = "#C22B1D";
  const INK = "#14161B";

  const base: Omit<Product, "watchers">[] = [
    { id: "p1", name: "Aeon Runner — Ash", blurb: "Reactive foam, ash colorway. First drop of the run.", price: 168, totalStock: 12, availableStock: 12, status: "live", dropAt: null, accent: COBALT, image: `${IMG}/photo-1549298916-b41d501d3772${q}` },
    { id: "p2", name: "Aeon Runner — Ember", blurb: "Same last, ember colorway. Runs small.", price: 168, totalStock: 8, availableStock: 8, status: "live", dropAt: null, accent: BRICK, image: `${IMG}/photo-1595950653106-6c9ebd614d3a${q}` },
    { id: "p3", name: "Field Jacket 02", blurb: "Waxed cotton, storm flap, brass hardware.", price: 245, totalStock: 6, availableStock: 6, status: "live", dropAt: null, accent: INK, image: `${IMG}/photo-1551028719-00167b16eac5${q}` },
    { id: "p4", name: "Signal Tee", blurb: "Heavyweight loopback cotton. Boxy fit.", price: 42, totalStock: 20, availableStock: 20, status: "live", dropAt: null, accent: COBALT, image: `${IMG}/photo-1521572163474-6864f9cf17ab${q}` },
    { id: "p5", name: "Cargo Utility Pant", blurb: "Ripstop nylon, six pockets, elastic cuff.", price: 128, totalStock: 10, availableStock: 10, status: "live", dropAt: null, accent: GOLD, image: `${IMG}/photo-1517438476312-10d79c077509${q}` },
    { id: "p6", name: "Aeon Runner — Glacier", blurb: "Limited glacier colorway. Reflective overlays.", price: 178, totalStock: 5, availableStock: 0, status: "sold_out", dropAt: null, accent: COBALT, image: `${IMG}/photo-1460353581641-37baddab0fa2${q}` },
    { id: "p7", name: "Wax Canvas Tote", blurb: "18oz canvas, leather straps, brass rivets.", price: 64, totalStock: 15, availableStock: 0, status: "sold_out", dropAt: null, accent: INK, image: `${IMG}/photo-1591561954557-26941169b49e${q}` },
    { id: "p8", name: "Night Ops Windbreaker", blurb: "Taped seams, packable, 3M trim.", price: 152, totalStock: 9, availableStock: 9, status: "dropping_soon", dropAt: new Date(now + 90_000).toISOString(), accent: BRICK, image: `${IMG}/photo-1544022613-e87ca75a784a${q}` },
    { id: "p9", name: "Studio Beanie", blurb: "Merino rib knit, tonal patch.", price: 34, totalStock: 25, availableStock: 25, status: "dropping_soon", dropAt: new Date(now + 3 * 60_000).toISOString(), accent: GOLD, image: `${IMG}/photo-1576871337622-98d48d1cf531${q}` },
    { id: "p10", name: "Aeon Runner — Void", blurb: "Blacked-out release. The one everyone wants.", price: 188, totalStock: 4, availableStock: 4, status: "dropping_soon", dropAt: new Date(now + 5 * 60_000).toISOString(), accent: INK, image: `${IMG}/photo-1542291026-7eec264c27ff${q}` },
  ];
  const map = new Map<string, Product>();
  for (const p of base) {
    map.set(p.id, { ...p, watchers: 20 + Math.floor(Math.random() * 180) });
  }
  return map;
}

function getDb(): DB {
  if (!g.__dropDayDb) {
    g.__dropDayDb = {
      products: seedProducts(),
      holds: new Map(),
      orders: new Map(),
      seq: 1,
      started: false,
    };
  }
  const db = g.__dropDayDb;
  if (!db.started) {
    db.started = true;
    setInterval(() => tick(db), 1000);
  }
  return db;
}

function nextId(prefix: string, db: DB) {
  return `${prefix}_${db.seq++}`;
}

// The simulation heartbeat: promotes drops, expires holds, lets "other
// shoppers" contend for stock, and drifts the hype meter. This is the single
// source of truth for time-based state — the UI never decides expiry itself.
function tick(db: DB) {
  const now = Date.now();

  for (const product of db.products.values()) {
    // Promote scheduled drops.
    if (product.status === "dropping_soon" && product.dropAt && new Date(product.dropAt).getTime() <= now) {
      product.status = product.availableStock > 0 ? "live" : "sold_out";
    }

    // Hype meter drift — small random walk, clamped, so it feels alive without
    // being distracting.
    if (product.status !== "sold_out") {
      const delta = Math.floor(Math.random() * 11) - 5;
      product.watchers = Math.max(3, product.watchers + delta);
    }

    // Simulated other shoppers quietly take live stock.
    if (product.status === "live" && product.availableStock > 0 && Math.random() < 0.06) {
      product.availableStock -= 1;
      if (product.availableStock === 0) product.status = "sold_out";
    }
  }

  for (const hold of db.holds.values()) {
    if (hold.status === "active" && new Date(hold.expiresAt).getTime() <= now) {
      hold.status = "expired";
      const product = db.products.get(hold.productId);
      if (product) {
        product.availableStock += hold.quantity;
        if (product.status === "sold_out" && product.availableStock > 0) {
          product.status = "live";
        }
      }
    }
  }
}

export function listProducts(): Product[] {
  const db = getDb();
  tick(db);
  return Array.from(db.products.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function getProduct(id: string): Product | undefined {
  const db = getDb();
  tick(db);
  return db.products.get(id);
}

export function listHolds(sessionId: string): Hold[] {
  const db = getDb();
  tick(db);
  return Array.from(db.holds.values())
    .filter((h) => h.sessionId === sessionId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export type CreateHoldResult =
  | { ok: true; hold: Hold }
  | { ok: false; reason: "NOT_FOUND" | "OUT_OF_STOCK" };

export function createHold(productId: string, quantity: number, sessionId: string): CreateHoldResult {
  const db = getDb();
  tick(db);
  const product = db.products.get(productId);
  if (!product) return { ok: false, reason: "NOT_FOUND" };
  if (product.status !== "live" || product.availableStock < quantity) {
    return { ok: false, reason: "OUT_OF_STOCK" };
  }
  product.availableStock -= quantity;
  if (product.availableStock === 0) product.status = "sold_out";

  const now = new Date();
  const hold: Hold = {
    id: nextId("h", db),
    productId,
    productName: product.name,
    price: product.price,
    quantity,
    sessionId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + HOLD_DURATION_MS).toISOString(),
    status: "active",
  };
  db.holds.set(hold.id, hold);
  return { ok: true, hold };
}

export type ReleaseResult = { ok: true; hold: Hold } | { ok: false; reason: "NOT_FOUND" | "NOT_ACTIVE" };

export function releaseHold(holdId: string, sessionId: string): ReleaseResult {
  const db = getDb();
  tick(db);
  const hold = db.holds.get(holdId);
  if (!hold || hold.sessionId !== sessionId) return { ok: false, reason: "NOT_FOUND" };
  if (hold.status !== "active") return { ok: false, reason: "NOT_ACTIVE" };
  hold.status = "released";
  const product = db.products.get(hold.productId);
  if (product) {
    product.availableStock += hold.quantity;
    if (product.status === "sold_out" && product.availableStock > 0) product.status = "live";
  }
  return { ok: true, hold };
}

export type CheckoutResult =
  | { ok: true; order: Order }
  | { ok: false; reason: "EMPTY" | "EXPIRED"; expiredIds: string[] };

export function checkout(holdIds: string[], sessionId: string): CheckoutResult {
  const db = getDb();
  tick(db);
  const holds = holdIds.map((id) => db.holds.get(id)).filter((h): h is Hold => !!h && h.sessionId === sessionId);
  if (holds.length === 0) return { ok: false, reason: "EMPTY", expiredIds: [] };

  const expired = holds.filter((h) => h.status !== "active");
  if (expired.length > 0) {
    return { ok: false, reason: "EXPIRED", expiredIds: expired.map((h) => h.id) };
  }

  for (const h of holds) h.status = "converted";
  const order: Order = {
    id: nextId("o", db),
    items: holds.map((h) => ({ productId: h.productId, productName: h.productName, quantity: h.quantity, price: h.price })),
    total: holds.reduce((sum, h) => sum + h.price * h.quantity, 0),
    createdAt: new Date().toISOString(),
  };
  db.orders.set(order.id, order);
  return { ok: true, order };
}

export function getHold(holdId: string): Hold | undefined {
  const db = getDb();
  tick(db);
  return db.holds.get(holdId);
}
