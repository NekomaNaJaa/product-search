"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useFavoriteButton } from "@/hooks/useFavoriteButton";

interface FavoriteButtonProps {
  productId: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const iconSizes = {
  sm: "size-4",
  md: "size-5",
  lg: "size-5",
};

const buttonSizes = {
  sm: "p-1.5",
  md: "p-2",
  lg: "px-4 py-2 gap-2 text-sm font-medium",
};

function FavoriteButton({
  productId,
  size = "md",
  showLabel = false,
  className = "",
}: FavoriteButtonProps) {
  const { active, handleClick, reduceMotion } = useFavoriteButton(productId);

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={active ? "นำออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
      aria-pressed={active}
      whileTap={{ scale: reduceMotion ? 1 : 0.88 }}
      whileHover={{ scale: reduceMotion ? 1 : 1.06 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`inline-flex items-center justify-center rounded-full transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
        showLabel
          ? active
            ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          : active
            ? "bg-white/90 text-red-500 shadow-sm backdrop-blur-xs hover:bg-white hover:text-red-600"
            : "bg-white/90 text-gray-400 shadow-sm backdrop-blur-xs hover:text-red-500 hover:bg-white"
      } ${buttonSizes[size]} ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-transform duration-200 ${
          active ? "fill-red-500 text-red-500 scale-110" : "text-current"
        }`}
        aria-hidden="true"
      />
      {showLabel && (
        <span>{active ? "ถูกใจแล้ว" : "เพิ่มในรายการโปรด"}</span>
      )}
    </motion.button>
  );
}

export default memo(FavoriteButton);
