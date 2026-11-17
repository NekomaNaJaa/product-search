import { useCallback } from "react";
import { useAutoFocus } from "@/hooks/useAutoFocus";

interface UseSearchBarOptions {
  onChange: (value: string) => void;
}

export function useSearchBar({ onChange }: UseSearchBarOptions) {
  const inputRef = useAutoFocus<HTMLInputElement>();

  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange, inputRef]);

  return {
    inputRef,
    handleClear,
  };
}
