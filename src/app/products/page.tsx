import { Suspense } from "react";
import LoadingState from "@/components/LoadingState";
import ProductsContent from "@/components/ProductsContent";

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState className="min-h-screen" />}>
      <ProductsContent />
    </Suspense>
  );
}
