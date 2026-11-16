import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);

      const next = params.toString();
      if (next === searchParams.toString()) return;

      router.replace(next ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, pathname, router],
  );

  return { searchParams, setParam };
}
