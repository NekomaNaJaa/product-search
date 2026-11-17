import { useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites";

export function useFavoriteButton(productId: number) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);
  const reduceMotion = useReducedMotion();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(productId);
    },
    [productId, toggleFavorite],
  );

  return {
    active,
    handleClick,
    reduceMotion,
  };
}
