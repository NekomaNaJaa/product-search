import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useFavorites } from "@/hooks/useFavorites";
import { useFavoriteProducts } from "@/hooks/useFavoriteProducts";
import {
  PAGE_SIZE,
  buildProductsUrl,
  getTotalPages,
  parsePage,
  parseSort,
  sortByPrice,
} from "@/lib/products";
import type { ProductsResponse, SortValue } from "@/types/product";

export function useProductSearch() {
  const { searchParams, setParams } = useQueryParams();
  const { favorites } = useFavorites();

  // sort และ page: URL เป็นแหล่งความจริง
  const sort = parseSort(searchParams.get("sort"));
  const page = parsePage(searchParams.get("page"));

  // q: state สำหรับช่องพิมพ์ เริ่มจาก URL แล้วเขียนกลับหลัง debounce
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const debouncedQuery = useDebounce(query.trim(), 500);

  const isFavMode = sort === "fav";

  // โหมดปกติ: ดึงข้อมูลสินค้าจาก API DummyJSON
  const {
    data,
    loading: apiLoading,
    error: apiError,
  } = useFetch<ProductsResponse>(
    isFavMode ? null : buildProductsUrl(debouncedQuery, page),
  );

  // โหมด Favorite: ดึงข้อมูลสินค้าเฉพาะรายการโปรดทั้งหมดจาก ID ที่บันทึกไว้ใน localStorage
  const {
    favoriteProducts,
    loading: favLoading,
    error: favError,
  } = useFavoriteProducts(favorites, isFavMode);

  // คำค้นเปลี่ยนจริงเท่านั้นจึงรีเซ็ตกลับหน้า 1
  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    if (urlQuery === debouncedQuery) return;
    setParams({ q: debouncedQuery, page: "" });
  }, [debouncedQuery, searchParams, setParams]);

  // กรองสินค้าที่ชอบตามคำค้นหา (ถ้ามี)
  const filteredFavProducts = useMemo(() => {
    if (!isFavMode) return [];
    if (!debouncedQuery) return favoriteProducts;
    const q = debouncedQuery.toLowerCase();
    return favoriteProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [isFavMode, debouncedQuery, favoriteProducts]);

  const totalPages = isFavMode
    ? getTotalPages(filteredFavProducts.length)
    : getTotalPages(data?.total ?? 0);

  const products = useMemo(() => {
    if (isFavMode) {
      const start = (page - 1) * PAGE_SIZE;
      return filteredFavProducts.slice(start, start + PAGE_SIZE);
    }
    return sortByPrice(data?.products ?? [], sort);
  }, [isFavMode, filteredFavProducts, page, data, sort]);

  const loading = isFavMode ? favLoading : apiLoading;
  const error = isFavMode ? favError : apiError;

  const handleSearchChange = useCallback(
    (value: string) => {
      setQuery(value);
    },
    [setQuery],
  );

  const handleSortChange = useCallback(
    (value: SortValue) => {
      const resetPage = value === "fav" || sort === "fav";
      setParams({
        sort: value,
        page: resetPage ? "" : (page > 1 ? String(page) : ""),
      });
    },
    [setParams, sort, page],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setParams({ page: nextPage > 1 ? String(nextPage) : "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setParams],
  );

  return {
    query,
    sort,
    page,
    totalPages,
    products,
    loading,
    error,
    handleSearchChange,
    handleSortChange,
    handlePageChange,
  };
}
