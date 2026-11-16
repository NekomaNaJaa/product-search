import { memo } from "react";
import { Search, X } from "lucide-react";
import { useAutoFocus } from "@/hooks/useAutoFocus";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useAutoFocus<HTMLInputElement>();

  function handleClear() {
    onChange("");
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full sm:max-w-sm">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ค้นหาสินค้า..."
        className="w-full rounded-lg border py-2 pl-9 pr-9 outline-none focus:ring-2 focus:ring-blue-500"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="ล้างคำค้นหา"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-700"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export default memo(SearchBar);
