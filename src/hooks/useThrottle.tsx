import { useCallback, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottle<F extends (...args: any[]) => any>(
  func: F,
  limit: number
): (...args: Parameters<F>) => void {
  const lastFunc = useRef<ReturnType<typeof setTimeout>>();
  const lastRan = useRef<number>();

  return useCallback(
    function (...args: Parameters<F>) {
      if (!lastRan.current) {
        func(...args);
        lastRan.current = Date.now();
      } else {
        if (lastFunc.current) {
          clearTimeout(lastFunc.current);
        }
        lastFunc.current = setTimeout(() => {
          if (Date.now() - lastRan.current! >= limit) {
            func(...args);
            lastRan.current = Date.now();
          }
        }, limit - (Date.now() - lastRan.current!));
      }
    },
    [func, limit]
  );
}

export default useThrottle;
