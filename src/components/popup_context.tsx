import React, {
  createContext,
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useClickOutside } from "use-events";

export const WrapperContext = createContext<any>(null);

interface PopupProviderProps {
  children: ReactNode;
}

type CursorOptions =
  | "move"
  | ""
  | "none"
  | "n-resize"
  | "s-resize"
  | "e-resize"
  | "w-resize";

interface RefHandler {
  ref: MutableRefObject<HTMLElement>;
  handler: (event: MouseEvent) => void;
}

const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
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
          rh.handler(event);
        }
      });
    }
  );

  useEffect(() => {
    // Setup event listeners
    const cleanupDrag = setupWrapperDrag();
    const cleanupAutoScroll = setupWrapperAutoScroll();

    return () => {
      cleanupDrag();
      cleanupAutoScroll();
    };
  }, []);

  useEffect(() => {
    document.body.style.cursor = cursor;
    document.body.style.userSelect = userSelect;
  }, [cursor, userSelect]);

  function setupWrapperDrag() {
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    const wrapper = document.querySelector("#root");

    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        // Use left mouse button for dragging
        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        setUserSelect("none");
        setCursor("move");
        event.preventDefault();
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const deltaX = event.clientX - dragStartX;
        const deltaY = event.clientY - dragStartY;
        (wrapper as HTMLElement).scrollLeft -= deltaX;
        (wrapper as HTMLElement).scrollTop -= deltaY;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
      }
    };

    const onMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        setUserSelect("");
        setCursor("");
      }
    };

    (wrapper as HTMLElement).addEventListener("mousedown", onMouseDown);
    (wrapper as HTMLElement).addEventListener("mousemove", onMouseMove);
    (wrapper as HTMLElement).addEventListener("mouseup", onMouseUp);

    return () => {
      (wrapper as HTMLElement).removeEventListener("mousedown", onMouseDown);
      (wrapper as HTMLElement).removeEventListener("mousemove", onMouseMove);
      (wrapper as HTMLElement).removeEventListener("mouseup", onMouseUp);
    };
  }

  function setupWrapperAutoScroll() {
    const wrapper = document.querySelector("#root");
    let autoScrolling = false;

    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        // Use left mouse button for auto-scroll
        autoScrolling = !autoScrolling;
        (wrapper as HTMLElement).style.cursor = autoScrolling ? cursor : "";
        event.preventDefault();
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (autoScrolling) {
        autoScroll(wrapper, event.clientX, event.clientY);
      }
    };

    const onMouseUp = () => {
      autoScrolling = false;
      (wrapper as HTMLElement).style.cursor = "";
    };

    (wrapper as HTMLElement).addEventListener("mousedown", onMouseDown);
    (wrapper as HTMLElement).addEventListener("mousemove", onMouseMove);
    (wrapper as HTMLElement).addEventListener("mouseup", onMouseUp);

    return () => {
      (wrapper as HTMLElement).removeEventListener("mousedown", onMouseDown);
      (wrapper as HTMLElement).removeEventListener("mousemove", onMouseMove);
      (wrapper as HTMLElement).removeEventListener("mouseup", onMouseUp);
    };
  }

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
