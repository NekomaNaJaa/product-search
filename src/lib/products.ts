import type { Product, SortValue } from "@/types/product";

export const PRODUCTS_API = "https://dummyjson.com/products";

export function buildProductsUrl(query: string): string {
  return query
    ? `${PRODUCTS_API}/search?q=${encodeURIComponent(query)}`
    : PRODUCTS_API;
}

export function parseSort(raw: string | null): SortValue {
  return raw === "asc" || raw === "desc" ? raw : "";
}

export function sortByPrice(products: Product[], sort: SortValue): Product[] {
  if (!sort) return products;
  return [...products].sort((a, b) =>
    sort === "asc" ? a.price - b.price : b.price - a.price,
  );
}
