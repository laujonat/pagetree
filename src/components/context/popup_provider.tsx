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
export const WrapperContext = createContext<any>(null);

interface PopupProviderProps {
  children: ReactNode;
}

const PopupProvider: FC<PopupProviderProps> = ({ children }) => {
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
    <WrapperContext.Provider value={{ registerClickOutside }}>
      {children}
    </WrapperContext.Provider>
  );
};

export default PopupProvider;
