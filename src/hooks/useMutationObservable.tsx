import { useEffect, useState } from "react";

import { useDebounce } from "./useDebounce"; // Adjust the import path as needed

interface MutationObserverOptions {
  config: MutationObserverInit;
  debounceTime?: number;
}

const DEFAULT_OPTIONS: MutationObserverOptions = {
  config: { attributes: true, childList: true, subtree: true },
};

function useMutationObservable(
  targetEl: Node | null,
  cb: MutationCallback,
  options: MutationObserverOptions = DEFAULT_OPTIONS
) {
  const [observer, setObserver] = useState<MutationObserver | null>(null);

  // Debounce callback if debounceTime is provided
  const debouncedCallback = options.debounceTime
    ? useDebounce(cb, options.debounceTime)
    : cb;

  useEffect(() => {
    const obs = new MutationObserver(debouncedCallback);
    setObserver(obs);
  }, [debouncedCallback]);

  useEffect(() => {
    if (!observer || !targetEl) return;

    try {
      observer.observe(targetEl, options.config);
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer, targetEl, options.config]);

  return observer; // Optionally return the observer
}

export default useMutationObservable;
