import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const FAVORITES_STORAGE_KEY = "favorites";
const INITIAL_FAVORITES: number[] = [];

export function useFavorites() {
  const [favorites, setFavorites, isHydrated] = useLocalStorage<number[]>(
    FAVORITES_STORAGE_KEY,
    INITIAL_FAVORITES,
  );

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  const isFavorite = useCallback(
    (id: number) => {
      if (!isHydrated) return false;
      return favoriteSet.has(id);
    },
    [favoriteSet, isHydrated],
  );

  const toggleFavorite = useCallback(
    (id: number) => {
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    },
    [setFavorites],
  );

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isHydrated,
  };
}
