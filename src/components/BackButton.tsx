"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeftIcon } from "lucide-react";

type Props = {
  href?: string;
  label?: string;
  onClick?: () => void;
};

export default function BackButton({
  href = "/products",
  label = "Back!",
  onClick,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="inline-block mb-4"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{
        rest: { scale: 1 },
        hover: { scale: reduceMotion ? 1 : 1.04 },
        tap: { scale: 0.96 },
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link
        href={href}
        onClick={(e) => {
          if (!onClick) return;
          e.preventDefault();
          onClick();
        }}
        className="relative inline-flex items-center overflow-hidden rounded-full border border-black px-5 py-1 font-medium outline-none focus-visible:ring-2 focus-visible:ring-black/50"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 origin-left bg-black"
          variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        <motion.span
          className="relative z-10 flex items-center gap-2"
          variants={{
            rest: { color: "#000000" },
            hover: { color: "#ffffff" },
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.span
            className="inline-flex"
            variants={{
              rest: { x: 0 },
              hover: { x: reduceMotion ? 0 : -4 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <ArrowLeftIcon className="size-4" />
          </motion.span>
          {label}
        </motion.span>
      </Link>
    </motion.div>
  );
}
