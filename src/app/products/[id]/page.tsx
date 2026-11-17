import { notFound } from "next/navigation";
import { PRODUCTS_API } from "@/lib/products";
import type { Product } from "@/types/product";
import ProductDetail from "@/components/ProductDetail";

async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${PRODUCTS_API}/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
