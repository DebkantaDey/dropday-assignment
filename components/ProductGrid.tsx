"use client";
import { useDropDayStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { GridSkeleton, GridError, GridEmpty } from "@/components/GridStates";

export function ProductGrid() {
  const products = useDropDayStore((s) => s.products);
  const status = useDropDayStore((s) => s.productsStatus);
  const error = useDropDayStore((s) => s.productsError);
  const pendingId = useDropDayStore((s) => s.pendingHoldProductId);
  const placeHold = useDropDayStore((s) => s.placeHold);
  const fetchProducts = useDropDayStore((s) => s.fetchProducts);

  if (status === "loading" || status === "idle") return <GridSkeleton />;
  if (status === "error") return <GridError message={error ?? "Something went wrong."} onRetry={fetchProducts} />;
  if (products.length === 0) return <GridEmpty />;

  const order = { live: 0, dropping_soon: 1, sold_out: 2 } as const;
  const sorted = [...products].sort((a, b) => order[a.status] - order[b.status]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sorted.map((p) => (
        <ProductCard key={p.id} product={p} onHold={placeHold} isPending={pendingId === p.id} />
      ))}
    </div>
  );
}
