import { useCallback, useMemo, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  // ตรวจสอบสถานะ client mount เพื่อป้องกัน hydration mismatch ใน Next.js
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener("local-storage", callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener("local-storage", callback);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const getServerSnapshot = useCallback(() => {
    return null;
  }, []);

  const rawValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // useMemo จะคำนวณใหม่เฉพาะเมื่อ rawValue (string ใน localStorage) เปลี่ยนแปลงจริงเท่านั้น
  const storedValue = useMemo<T>(() => {
    if (!isHydrated || rawValue === null) {
      return initialValue;
    }
    try {
      return JSON.parse(rawValue) as T;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [isHydrated, rawValue, initialValue, key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const currentRaw =
          typeof window !== "undefined"
            ? window.localStorage.getItem(key)
            : null;
        let current = initialValue;
        if (currentRaw !== null) {
          try {
            current = JSON.parse(currentRaw) as T;
          } catch {
            current = initialValue;
          }
        }

        const valueToStore =
          typeof value === "function"
            ? (value as (prev: T) => T)(current)
            : value;

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(new Event("local-storage"));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, initialValue],
  );

  return [storedValue, setValue, isHydrated];
}
