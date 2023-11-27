import {
  createContext,
  FC,
  MutableRefObject,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { useClickOutside } from "use-events";

import { RefHandler } from "../../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WindowContext = createContext<any>(null);

interface WindowProviderProps {
  children: ReactNode;
}

const WindowProvider: FC<WindowProviderProps> = ({ children }) => {
  const refsHandlers = useRef<RefHandler[]>([]);

  const registerClickOutside = useCallback(
    (
      ref: MutableRefObject<HTMLElement>,
      handler: (event: MouseEvent) => void
    ) => {
      refsHandlers.current.push({ ref, handler });

      return () => {
        refsHandlers.current = refsHandlers.current.filter(
          (rh) => rh.ref !== ref
        );
      };
    },
    []
  );

  useClickOutside(
    refsHandlers.current.map((rh) => rh.ref),
    (event: MouseEvent) => {
      refsHandlers.current.forEach((rh) => {
        if (rh.ref.current && !rh.ref.current.contains(event.target as Node)) {
          console.log(event);
          rh.handler(event);
        }
      });
    }
  );

  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      console.log("Tab reopened, refetch the data!");
    }
  };

  useLayoutEffect(() => {
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <WindowContext.Provider value={{ registerClickOutside }}>
      {children}
    </WindowContext.Provider>
  );
};

export default WindowProvider;
