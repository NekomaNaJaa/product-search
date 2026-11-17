"use client";

import { memo } from "react";
import { ArrowUpDown } from "lucide-react";
import type { SortValue } from "@/types/product";

interface SortSelectProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
}

function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <ArrowUpDown className="size-4 text-gray-500" aria-hidden="true" />
      <span className="sr-only">เรียงตามราคา</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortValue)}
        className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">ไม่เรียง</option>
        <option value="fav">รายการโปรด</option>
        <option value="asc">ราคา: น้อยไปมาก</option>
        <option value="desc">ราคา: มากไปน้อย</option>
      </select>
    </label>
  );
}

export default memo(SortSelect);
