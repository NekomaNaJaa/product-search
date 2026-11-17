import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";

interface UseBackButtonOptions {
  href?: string;
  onClick?: () => void;
}

export function useBackButton({
  href = "/products",
  onClick,
}: UseBackButtonOptions = {}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (onClick) {
        onClick();
      } else if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push(href);
      }
    },
    [onClick, router, href],
  );

  return {
    handleClick,
    reduceMotion,
  };
}
