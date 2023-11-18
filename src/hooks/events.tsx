import { useEffect, useRef } from "react";

export function useEventListener(eventName, handler) {
  const handlerRef = useRef<((event: Event) => void) | null>(null);

  useEffect(() => {
    if (handlerRef && handlerRef.current) {
      handlerRef.current = handler;
    }
  }, [handler]);

  useEffect(() => {
    if (handlerRef && handlerRef.current) {
      const eventListener: EventListener = (event) => {
        if (handlerRef.current) {
          handlerRef.current(event);
        }
      };
      document.addEventListener(eventName, eventListener);
      return () => {
        document.removeEventListener(eventName, eventListener);
      };
    }
  }, [eventName]);
}
