import { useEffect, useMemo, useState } from "react";
import { PRODUCTS_API } from "@/lib/products";
import type { Product } from "@/types/product";

// แคชสินค้าในหน่วยความจำเพื่อป้องกันการยิง API ซ้ำซ้อนและป้องกัน HTTP 429 Too Many Requests
const productCache = new Map<number, Product>();

export function useFavoriteProducts(favorites: number[], enabled: boolean) {
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const favoritesKey = favorites.join(",");

  useEffect(() => {
    if (!enabled || !favoritesKey) return;

    const currentFavorites = favoritesKey
      .split(",")
      .map(Number)
      .filter((n) => !isNaN(n));

    const missingIds = currentFavorites.filter((id) => !productCache.has(id));
    if (missingIds.length === 0) return;

    const controller = new AbortController();

    async function fetchMissingFavorites() {
      setLoading(true);
      setError(null);
      try {
        const promises = missingIds.map(async (id) => {
          try {
            const res = await fetch(`${PRODUCTS_API}/${id}`, {
              signal: controller.signal,
            });
            if (!res.ok) return null;
            const product = (await res.json()) as Product;
            productCache.set(id, product);
            return product;
          } catch {
            return null;
          }
        });

        await Promise.all(promises);

        if (!controller.signal.aborted) {
          // แจ้งให้ re-render เพื่อคำนวณ favoriteProducts จากแคชใหม่
          setVersion((v) => v + 1);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดรายการโปรด",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchMissingFavorites();

    return () => controller.abort();
  }, [favoritesKey, enabled]);

  const favoriteProducts = useMemo(() => {
    void version;
    if (!enabled || favorites.length === 0) return [];
    const reversed = [...favorites].reverse();
    return reversed
      .map((id) => productCache.get(id))
      .filter((p): p is Product => p !== undefined);
  }, [enabled, favorites, version]);

  return {
    favoriteProducts,
    loading,
    error,
  };
}
