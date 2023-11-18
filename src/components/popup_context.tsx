import React, {
  createContext,
  MutableRefObject,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useClickOutside } from "use-events";

import { RefHandler } from "../types";

export const WrapperContext = createContext<any>(null);

interface PopupProviderProps {
  children: ReactNode;
}

type CursorOptions =
  | ""
  | "default"
  | "move"
  | "none"
  | "n-resize"
  | "s-resize"
  | "e-resize"
  | "w-resize";

const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const dragStartX = useRef<number>(0);
  const dragStartY = useRef<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [cursor, setCursor] = useState<CursorOptions>(
    document.body.style.cursor as CursorOptions
  );
  const [userSelect, setUserSelect] = useState<string>(
    document.body.style.userSelect
  );

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

  //   useEffect(() => {
  //     const wrapper = document.querySelector("section.wrapper") as HTMLElement;

  //     const onMouseDown = (event) => {
  //       console.log("mousedown");
  //       if (event.button === 0) {
  //         // Update refs with the current mouse position
  //         dragStartX.current = event.clientX;
  //         dragStartY.current = event.clientY;
  //         setIsDragging(true);
  //         setCursor("move");
  //         setUserSelect("none");
  //       } else if (event.button === 1) {
  //         setIsAutoScrolling(!isAutoScrolling);
  //         setCursor(isAutoScrolling ? "move" : "");
  //       }
  //     };

  //     const onMouseMove = (event) => {
  //       if (isDragging) {
  //         console.log("dragging");
  //         const deltaX = event.clientX - dragStartX.current;
  //         const deltaY = event.clientY - dragStartY.current;
  //         if (wrapper) {
  //           wrapper.scrollLeft -= deltaX;
  //           wrapper.scrollTop -= deltaY;
  //           // Update the current position in the refs
  //           dragStartX.current = event.clientX;
  //           dragStartY.current = event.clientY;
  //         }
  //       } else if (isAutoScrolling) {
  //         console.log("auto scrolling");
  //         autoScroll(wrapper, event.clientX, event.clientY);
  //       }
  //     };
  //     const onMouseUp = (event) => {
  //       if (event.button === 0 && isDragging) {
  //         setIsDragging(false);
  //         setCursor("default");
  //         setUserSelect("auto");
  //       } else if (event.button === 1 && isAutoScrolling) {
  //         setIsAutoScrolling(false);
  //         setCursor("default");
  //       }
  //     };

  //     window.addEventListener("mousedown", onMouseDown);
  //     window.addEventListener("mouseup", onMouseUp);
  //     wrapper && wrapper.addEventListener("mousemove", onMouseMove);

  //     return () => {
  //       // Cleanup
  //       window.removeEventListener("mousedown", onMouseDown);
  //       window.removeEventListener("mouseup", onMouseUp);
  //       wrapper && wrapper.removeEventListener("mousemove", onMouseMove);
  //     };
  //   }, [isDragging, isAutoScrolling, cursor]);

  //   useEffect(() => {
  //     document.body.style.cursor = cursor;
  //     document.body.style.userSelect = userSelect;
  //   }, [cursor, userSelect]);

  function autoScroll(wrapper, clientX, clientY) {
    const rect = wrapper.getBoundingClientRect();
    const threshold = { x: 80, y: 100 };
    const scrollSpeed = { x: 30, y: 30 };

    const distanceFromLeftEdge = clientX - rect.left;
    const distanceFromRightEdge = rect.right - clientX;
    const distanceFromTopEdge = clientY - rect.top;
    const distanceFromBottomEdge = rect.bottom - clientY;

    if (distanceFromLeftEdge < threshold.x) {
      wrapper.scrollLeft -= scrollSpeed.x;
      setCursor("w-resize");
    } else if (distanceFromRightEdge < threshold.x) {
      wrapper.scrollLeft += scrollSpeed.x;
      setCursor("e-resize");
    }

    if (distanceFromTopEdge < threshold.y) {
      wrapper.scrollTop -= scrollSpeed.y;
      setCursor("n-resize");
    } else if (distanceFromBottomEdge < threshold.y) {
      wrapper.scrollTop += scrollSpeed.y;
      setCursor("s-resize");
    }
  }

  return (
    <WrapperContext.Provider
      value={{ cursor, userSelect, registerClickOutside }}
    >
      {children}
    </WrapperContext.Provider>
  );
};

export default PopupProvider;
