import { useReducedMotion } from "framer-motion";

const spring = { type: "spring", stiffness: 400, damping: 25 } as const;

export function usePaginationMotion() {
  const reduceMotion = useReducedMotion();

  return {
    spring,
    press: reduceMotion
      ? {}
      : { whileHover: { scale: 1.08 }, whileTap: { scale: 0.94 } },
    indicatorTransition: reduceMotion ? { duration: 0 } : spring,
    colorTransition: { duration: reduceMotion ? 0 : 0.2 },
  };
}
