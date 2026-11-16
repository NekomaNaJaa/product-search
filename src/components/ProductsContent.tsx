"use client";

import { useProductSearch } from "@/hooks/useProductSearch";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import SortSelect from "@/components/SortSelect";
import Pagination from "@/components/Pagination";

export default function ProductsContent() {
  const {
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
  } = useProductSearch();

  return (
    <main className="mx-auto w-full max-w-6xl p-4">
      <h1 className="mb-4 w-full text-center text-4xl font-bold">สินค้า</h1>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={query} onChange={handleSearchChange} />
        <SortSelect value={sort} onChange={handleSortChange} />
      </div>

      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="text-red-600">เกิดข้อผิดพลาด: {error}</p>}
      {!loading && !error && products.length === 0 && <p>ไม่พบสินค้า</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </main>
  );
}
