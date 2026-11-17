"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Gift,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Tag,
  type LucideIcon,
} from "lucide-react";

type FloatingIcon = {
  Icon: LucideIcon;
  /** ตำแหน่งและขนาดของวงกลมไอคอน (Tailwind) */
  className: string;
  /** หน่วงก่อนปรากฏ (วินาที) */
  delay: number;
  /** ความเร็วในการลอยหนึ่งรอบ (วินาที) */
  duration: number;
  /** ระยะลอยขึ้น (px) */
  drift: number;
};

// ไอคอนที่เกี่ยวกับร้านค้า วางกระจายรอบข้อความ
// ซ่อนบางตัวบนมือถือเพื่อไม่ให้ทับข้อความ
const FLOATING_ICONS: FloatingIcon[] = [
  {
    Icon: ShoppingCart,
    className: "left-[6%] top-[12%] size-14",
    delay: 0.1,
    duration: 6,
    drift: 10,
  },
  {
    Icon: Package,
    className: "right-[8%] top-[16%] size-16",
    delay: 0.25,
    duration: 7,
    drift: 12,
  },
  {
    Icon: Tag,
    className: "left-[14%] bottom-[16%] size-12",
    delay: 0.4,
    duration: 5.5,
    drift: 8,
  },
  {
    Icon: Gift,
    className: "right-[14%] bottom-[14%] size-14",
    delay: 0.55,
    duration: 6.5,
    drift: 10,
  },
  {
    Icon: ShoppingBag,
    className: "left-[30%] top-[6%] hidden size-10 sm:flex",
    delay: 0.7,
    duration: 5,
    drift: 7,
  },
  {
    Icon: Search,
    className: "right-[30%] bottom-[6%] hidden size-10 sm:flex",
    delay: 0.85,
    duration: 7.5,
    drift: 9,
  },
];

export interface PageNotFoundProps {
  title?: string;
  description?: string;
  code?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export default function PageNotFound({
  title = "ไม่พบหน้าที่ต้องการ",
  description = "ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว ลองกลับไปเลือกดูสินค้าแทน",
  code = "404",
  ctaHref = "/products",
  ctaLabel = "ดูสินค้าทั้งหมด",
}: PageNotFoundProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gray-50 px-4 py-16">
      {/* ไอคอนลอยเบาๆ: ตกแต่งอย่างเดียว ไม่ต้องอ่านออกเสียง */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {FLOATING_ICONS.map(({ Icon, className, delay, duration, drift }) => (
          <motion.div
            key={className}
            className={`absolute flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              reduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 1, scale: 1, y: [0, -drift, 0] }
            }
            transition={{
              opacity: { duration: 0.5, delay },
              scale: { duration: 0.5, delay },
              y: {
                duration,
                delay: delay + 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <Icon className="size-1/2" strokeWidth={1.75} />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        <p className="text-[clamp(6rem,22vw,10rem)] font-bold leading-none tracking-tight text-gray-900">
          {code}
        </p>
        <h1 className="mt-4 text-2xl font-bold text-gray-800">{title}</h1>
        <p className="mt-2 text-gray-500">{description}</p>

        <Link
          href={ctaHref}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          {ctaLabel}
        </Link>
      </div>
    </main>
  );
}
