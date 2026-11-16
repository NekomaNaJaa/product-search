import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { PRODUCTS_API } from "@/lib/products";
import type { Product } from "@/types/product";

export function useProductDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const {
    data: product,
    loading,
    error,
  } = useFetch<Product>(id ? `${PRODUCTS_API}/${id}` : null);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push("/products");
  }, [router]);

  return { product, loading, error, handleBack };
}
