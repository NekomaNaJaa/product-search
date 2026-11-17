import type { Product, SortValue } from "@/types/product";

export const PRODUCTS_API = "https://dummyjson.com/products";
export const PAGE_SIZE = 28;

export type PageItem = number | "start-ellipsis" | "end-ellipsis";

export function buildProductsUrl(query: string, page: number): string {
  const skip = (page - 1) * PAGE_SIZE;
  const paging = `limit=${PAGE_SIZE}&skip=${skip}`;
  return query
    ? `${PRODUCTS_API}/search?q=${encodeURIComponent(query)}&${paging}`
    : `${PRODUCTS_API}?${paging}`;
}

export function parseSort(raw: string | null): SortValue {
  return raw === "asc" || raw === "desc" || raw === "fav" ? raw : "";
}

export function parsePage(raw: string | null): number {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function getTotalPages(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

export function sortByPrice(products: Product[], sort: SortValue): Product[] {
  if (!sort || sort === "fav") return products;
  return [...products].sort((a, b) =>
    sort === "asc" ? a.price - b.price : b.price - a.price,
  );
}

// ตัวอย่าง: 1 … 4 [5] 6 … 17
export function getPageItems(
  page: number,
  totalPages: number,
  windowSize = 3,
): PageItem[] {
  const half = Math.floor(windowSize / 2);
  const start = Math.max(1, Math.min(page - half, totalPages - windowSize + 1));
  const end = Math.min(totalPages, start + windowSize - 1);

  const items: PageItem[] = [];
  if (start > 1) items.push(1);
  if (start > 2) items.push("start-ellipsis");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("end-ellipsis");
  if (end < totalPages) items.push(totalPages);
  return items;
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${PRODUCTS_API}/${id}`);
    if (!res.ok) return null;
    return (await res.json()) as Product;
  } catch {
    return null;
  }
}
