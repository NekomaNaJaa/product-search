import { useEffect, useState } from "react";
import { PAGE_SIZE, PRODUCTS_API } from "@/lib/products";
import type { Product, ProductsResponse } from "@/types/product";

let allProductsCache: Product[] | null = null;

async function getAllProducts(signal?: AbortSignal): Promise<Product[]> {
  if (allProductsCache) return allProductsCache;
  try {
    const res = await fetch(`${PRODUCTS_API}?limit=0`, { signal });
    if (!res.ok) return [];
    const json: ProductsResponse = await res.json();
    allProductsCache = json.products;
    return json.products;
  } catch {
    return [];
  }
}

export function useCombinedProducts(
  query: string,
  page: number,
  enabled: boolean,
) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      const skip = (page - 1) * PAGE_SIZE;

      try {
        // กรณีไม่มีคำค้นหา: ดึงสินค้าทั้งหมดแบบแบ่งหน้าตามปกติ
        if (!query) {
          const res = await fetch(
            `${PRODUCTS_API}?limit=${PAGE_SIZE}&skip=${skip}`,
            { signal: controller.signal },
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json: ProductsResponse = await res.json();
          if (!controller.signal.aborted) {
            setData(json);
          }
          return;
        }

        const trimmedQuery = query.trim().toLowerCase();

        // ดึงทั้ง 2 ทางพร้อมกัน:
        // 1) Keyword search จาก API สำหรับค้นหาตาม Product Title / Description
        // 2) ตรวจสอบ Tag ชื่อเต็ม (Exact tag match) จากรายการสินค้าทั้งหมด
        const [searchRes, allProducts] = await Promise.all([
          fetch(
            `${PRODUCTS_API}/search?q=${encodeURIComponent(query.trim())}&limit=0`,
            { signal: controller.signal },
          ).then(async (res) =>
            res.ok ? ((await res.json()) as ProductsResponse) : null,
          ),
          getAllProducts(controller.signal),
        ]);

        const productMap = new Map<number, Product>();

        // 1. นำผลลัพธ์ที่ตรงกับ Title/Description จาก Search API เข้า Map
        if (searchRes && searchRes.products) {
          for (const item of searchRes.products) {
            productMap.set(item.id, item);
          }
        }

        // 2. นำผลลัพธ์ที่ Tag ตรงกับคำค้นหาแบบชื่อเต็ม (Exact full tag match) เข้า Map
        for (const item of allProducts) {
          const hasExactTag = item.tags?.some(
            (tag) => tag.toLowerCase() === trimmedQuery,
          );
          if (hasExactTag) {
            productMap.set(item.id, item);
          }
        }

        const combinedProducts = Array.from(productMap.values());
        const total = combinedProducts.length;
        const paginatedProducts = combinedProducts.slice(
          skip,
          skip + PAGE_SIZE,
        );

        if (!controller.signal.aborted) {
          setData({
            products: paginatedProducts,
            total,
            skip,
            limit: PAGE_SIZE,
          });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [query, page, enabled]);

  return {
    data: enabled ? data : null,
    loading: enabled ? loading : false,
    error: enabled ? error : null,
  };
}
