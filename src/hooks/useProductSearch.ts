import { useCallback, useEffect, useMemo, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryParams } from "@/hooks/useQueryParams";
import { buildProductsUrl, parseSort, sortByPrice } from "@/lib/products";
import type { ProductsResponse, SortValue } from "@/types/product";

export function useProductSearch() {
  const { searchParams, setParam } = useQueryParams();

  const sort = parseSort(searchParams.get("sort"));

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const debouncedQuery = useDebounce(query.trim(), 500);

  useEffect(() => {
    setParam("q", debouncedQuery);
  }, [debouncedQuery, setParam]);

  const { data, loading, error } = useFetch<ProductsResponse>(
    buildProductsUrl(debouncedQuery),
  );

  const products = useMemo(
    () => sortByPrice(data?.products ?? [], sort),
    [data, sort],
  );

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleSortChange = useCallback(
    (value: SortValue) => setParam("sort", value),
    [setParam],
  );

  return {
    query,
    sort,
    products,
    loading,
    error,
    handleSearchChange,
    handleSortChange,
  };
}
