import { ApiError, ApiResult, Hold, Order, Product } from "@/lib/types";

const BASE_URL = "/api";

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  const KEY = "drop-day-session-id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-session-id": getSessionId(),
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiError | null;
      return {
        ok: false,
        error: body ?? { code: "SERVER", message: `Request failed (${res.status}).` },
      };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, error: { code: "NETWORK", message: "Couldn't reach the server. Check your connection." } };
  }
}

export const api = {
  getProducts(): Promise<ApiResult<Product[]>> {
    return request<Product[]>("/products");
  },

  getHolds(): Promise<ApiResult<Hold[]>> {
    return request<Hold[]>("/holds");
  },

  placeHold(productId: string, quantity = 1): Promise<ApiResult<Hold>> {
    return request<Hold>(`/products/${productId}/hold`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    });
  },

  releaseHold(holdId: string): Promise<ApiResult<Hold>> {
    return request<Hold>(`/holds/${holdId}`, { method: "DELETE" });
  },

  checkout(holdIds: string[]): Promise<ApiResult<Order>> {
    return request<Order>("/checkout", {
      method: "POST",
      body: JSON.stringify({ holdIds }),
    });
  },
};
