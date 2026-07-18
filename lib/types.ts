export type ProductStatus = "live" | "dropping_soon" | "sold_out";

export interface Product {
  id: string;
  name: string;
  blurb: string;
  price: number;
  totalStock: number;
  availableStock: number;
  status: ProductStatus;
  dropAt: string | null; // ISO timestamp, only meaningful for "dropping_soon"
  watchers: number; // hype meter — live viewer count
  accent: string; // hex, per-product tag color
  image: string; // product photo URL
}

export type HoldStatus = "active" | "expired" | "released" | "converted";

export interface Hold {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  sessionId: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO — authoritative, set by the server
  status: HoldStatus;
}

export interface Order {
  id: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  total: number;
  createdAt: string;
}

export interface ApiError {
  code:
    | "OUT_OF_STOCK"
    | "RATE_LIMITED"
    | "NETWORK"
    | "HOLD_EXPIRED"
    | "HOLD_NOT_FOUND"
    | "NOT_FOUND"
    | "SERVER";
  message: string;
  expiredIds?: string[];
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };
