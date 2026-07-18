import { create } from "zustand";
import { api } from "@/lib/api-client";
import { Hold, Order, Product } from "@/lib/types";

type LoadStatus = "idle" | "loading" | "ready" | "error";

export interface Notice {
  id: string;
  tone: "info" | "danger" | "success";
  message: string;
}

export type CheckoutStage = "idle" | "summary" | "processing" | "success" | "failed";

interface DropDayState {
  products: Product[];
  productsStatus: LoadStatus;
  productsError: string | null;

  holds: Hold[];
  holdsStatus: LoadStatus;

  pendingHoldProductId: string | null; // product currently being requested — disables its button

  notices: Notice[];

  checkoutStage: CheckoutStage;
  checkoutError: string | null;
  expiredDuringCheckout: string[];
  lastOrder: Order | null;

  fetchProducts: () => Promise<void>;
  fetchHolds: () => Promise<void>;
  placeHold: (productId: string) => Promise<void>;
  releaseHold: (holdId: string) => Promise<void>;
  openCheckout: () => void;
  closeCheckout: () => void;
  confirmCheckout: () => Promise<void>;
  dismissNotice: (id: string) => void;
  pushNotice: (tone: Notice["tone"], message: string) => void;
  reconcileExpiredHolds: (previous: Hold[], next: Hold[]) => void;
}

let noticeSeq = 0;

export const useDropDayStore = create<DropDayState>((set, get) => ({
  products: [],
  productsStatus: "idle",
  productsError: null,

  holds: [],
  holdsStatus: "idle",

  pendingHoldProductId: null,

  notices: [],

  checkoutStage: "idle",
  checkoutError: null,
  expiredDuringCheckout: [],
  lastOrder: null,

  fetchProducts: async () => {
    if (get().productsStatus === "idle") set({ productsStatus: "loading" });
    const res = await api.getProducts();
    if (res.ok) {
      set({ products: res.data, productsStatus: "ready", productsError: null });
    } else {
      set({ productsStatus: "error", productsError: res.error.message });
    }
  },

  fetchHolds: async () => {
    const previous = get().holds;
    const res = await api.getHolds();
    if (res.ok) {
      get().reconcileExpiredHolds(previous, res.data);
      set({ holds: res.data, holdsStatus: "ready" });
    }
  },

  reconcileExpiredHolds: (previous, next) => {
    const nextById = new Map(next.map((h) => [h.id, h]));
    for (const prev of previous) {
      if (prev.status !== "active") continue;
      const current = nextById.get(prev.id);
      if (current && current.status === "expired") {
        get().pushNotice("danger", `Hold on "${prev.productName}" expired — it's back in the pool.`);
      }
    }
  },

  placeHold: async (productId) => {
    set({ pendingHoldProductId: productId });
    const res = await api.placeHold(productId, 1);
    set({ pendingHoldProductId: null });
    if (res.ok) {
      set((s) => ({ holds: [...s.holds, res.data] }));
      get().pushNotice("success", `Holding "${res.data.productName}" for 60 seconds.`);
      get().fetchProducts();
    } else {
      const msg =
        res.error.code === "OUT_OF_STOCK"
          ? "Too slow — another shopper just took the last one."
          : res.error.message;
      get().pushNotice("danger", msg);
      get().fetchProducts();
    }
  },

  releaseHold: async (holdId) => {
    const res = await api.releaseHold(holdId);
    if (res.ok) {
      set((s) => ({ holds: s.holds.map((h) => (h.id === holdId ? res.data : h)) }));
      get().pushNotice("info", `Released "${res.data.productName}".`);
      get().fetchProducts();
    } else {
      get().pushNotice("danger", res.error.message);
      get().fetchHolds();
    }
  },

  openCheckout: () => set({ checkoutStage: "summary", checkoutError: null, expiredDuringCheckout: [] }),
  closeCheckout: () => set({ checkoutStage: "idle", checkoutError: null }),

  confirmCheckout: async () => {
    const activeHolds = get().holds.filter((h) => h.status === "active");
    if (activeHolds.length === 0) {
      set({ checkoutStage: "failed", checkoutError: "Nothing left to check out — every hold expired." });
      return;
    }
    set({ checkoutStage: "processing", checkoutError: null });
    const res = await api.checkout(activeHolds.map((h) => h.id));
    if (res.ok) {
      set({ checkoutStage: "success", lastOrder: res.data });
      get().fetchHolds();
      get().fetchProducts();
    } else {
      set({
        checkoutStage: "failed",
        checkoutError: res.error.message,
        expiredDuringCheckout: res.error.expiredIds ?? [],
      });
      get().fetchHolds();
    }
  },

  pushNotice: (tone, message) => {
    const id = `n${++noticeSeq}`;
    set((s) => ({ notices: [...s.notices, { id, tone, message }] }));
    setTimeout(() => get().dismissNotice(id), 5000);
  },

  dismissNotice: (id) => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),
}));
