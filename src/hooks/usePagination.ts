import { getPageItems } from "@/lib/products";

interface UsePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function usePagination({
  page,
  totalPages,
  onPageChange,
}: UsePaginationProps) {
  return {
    visible: totalPages > 1,
    items: getPageItems(page, totalPages),
    canGoPrev: page > 1,
    canGoNext: page < totalPages,
    goPrev: () => onPageChange(page - 1),
    goNext: () => onPageChange(page + 1),
    goTo: onPageChange,
  };
}
