"use client";
import { useEffect } from "react";
import { useDropDayStore } from "@/lib/store";
import { Header } from "@/components/Header";
import { ProductGrid } from "@/components/ProductGrid";
import { HoldsPanel } from "@/components/HoldsPanel";
import { CheckoutModal } from "@/components/CheckoutModal";
import { NoticeStack } from "@/components/NoticeStack";

const PRODUCTS_POLL_MS = 4000;
const HOLDS_POLL_MS = 2000;

export function DropDayApp() {
  const fetchProducts = useDropDayStore((s) => s.fetchProducts);
  const fetchHolds = useDropDayStore((s) => s.fetchHolds);
  const openCheckout = useDropDayStore((s) => s.openCheckout);

  // Two open tabs share one sessionId via localStorage, and both poll the
  // same server state, so a hold placed in tab A appears in tab B within one
  // poll cycle. See DECISIONS.md, question 5.
  useEffect(() => {
    fetchProducts();
    fetchHolds();
    const productsTimer = setInterval(fetchProducts, PRODUCTS_POLL_MS);
    const holdsTimer = setInterval(fetchHolds, HOLDS_POLL_MS);
    const onFocus = () => {
      fetchProducts();
      fetchHolds();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(productsTimer);
      clearInterval(holdsTimer);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchProducts, fetchHolds]);

  return (
    <div className="mx-auto w-11/12 lg:w-[80%] max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <NoticeStack />
      <Header />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <ProductGrid />
        <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]">
          <HoldsPanel onCheckout={openCheckout} />
        </div>
      </div>
      <CheckoutModal />
    </div>
  );
}
