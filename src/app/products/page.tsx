import { Suspense } from "react";
import ProductsContent from "@/components/ProductsContent";

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="p-4">กำลังโหลด...</p>}>
      <ProductsContent />
    </Suspense>
  );
}
