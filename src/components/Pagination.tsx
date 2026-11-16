import { memo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";
import { usePaginationMotion } from "@/hooks/usePaginationMotion";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const pill =
  "rounded-full border-black bg-transparent shadow-none hover:bg-black/5 hover:text-black";
const edgeButton = "gap-1 max-sm:size-9 max-sm:has-[>svg]:px-0";

function Pagination({ page, totalPages, onPageChange }: Props) {
  const { visible, items, canGoPrev, canGoNext, goPrev, goNext, goTo } =
    usePagination({ page, totalPages, onPageChange });
  const { spring, press, indicatorTransition, colorTransition } =
    usePaginationMotion();

  if (!visible) return null;

  return (
    <div className="mt-8 space-y-2">
      <PaginationRoot aria-label="การแบ่งหน้า">
        <PaginationContent className="flex-wrap justify-center">
          <PaginationItem>
            <motion.button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="หน้าก่อนหน้า"
              className={cn(
                buttonVariants({ variant: "outline" }),
                pill,
                edgeButton,
              )}
              transition={spring}
              {...press}
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">ก่อนหน้า</span>
            </motion.button>
          </PaginationItem>

          {items.map((item) =>
            typeof item === "number" ? (
              <PaginationItem key={item}>
                <motion.button
                  type="button"
                  onClick={() => goTo(item)}
                  aria-label={`ไปหน้า ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    pill,
                    "relative",
                  )}
                  transition={spring}
                  {...press}
                >
                  {item === page && (
                    <motion.span
                      layoutId="pagination-active"
                      className="absolute inset-0 rounded-full bg-black"
                      transition={indicatorTransition}
                    />
                  )}
                  <motion.span
                    className="relative z-10"
                    animate={{ color: item === page ? "#ffffff" : "#000000" }}
                    transition={colorTransition}
                  >
                    {item}
                  </motion.span>
                </motion.button>
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationEllipsis />
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <motion.button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              aria-label="หน้าถัดไป"
              className={cn(
                buttonVariants({ variant: "outline" }),
                pill,
                edgeButton,
              )}
              transition={spring}
              {...press}
            >
              <span className="hidden sm:inline">ถัดไป</span>
              <ChevronRight className="size-4" />
            </motion.button>
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>

      <p
        aria-live="polite"
        className="text-center text-sm text-muted-foreground"
      >
        หน้า {page} จาก {totalPages}
      </p>
    </div>
  );
}

export default memo(Pagination);
