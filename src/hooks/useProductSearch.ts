import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryParams } from "@/hooks/useQueryParams";
import {
  buildProductsUrl,
  getTotalPages,
  parsePage,
  parseSort,
  sortByPrice,
} from "@/lib/products";
import type { ProductsResponse, SortValue } from "@/types/product";

export function useProductSearch() {
  const { searchParams, setParams } = useQueryParams();

  // sort และ page: URL เป็นแหล่งความจริง
  const sort = parseSort(searchParams.get("sort"));
  const page = parsePage(searchParams.get("page"));

  // q: state สำหรับช่องพิมพ์ เริ่มจาก URL แล้วเขียนกลับหลัง debounce
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const debouncedQuery = useDebounce(query.trim(), 500);

  // คำค้นเปลี่ยนจริงเท่านั้นจึงรีเซ็ตกลับหน้า 1
  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    if (urlQuery === debouncedQuery) return;
    setParams({ q: debouncedQuery, page: "" });
  }, [debouncedQuery, searchParams, setParams]);

  const { data, loading, error } = useFetch<ProductsResponse>(
    buildProductsUrl(debouncedQuery, page),
  );

  const totalPages = getTotalPages(data?.total ?? 0);

  const products = useMemo(
    () => sortByPrice(data?.products ?? [], sort),
    [data, sort],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setQuery(value);
    },
    [setQuery],
  );

  const handleSortChange = useCallback(
    (value: SortValue) => setParams({ sort: value }),
    [setParams],
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
