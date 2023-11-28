import { RefObject, useLayoutEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type Orientation = "horizontal" | "vertical";

export const useCenteredTree = (
  orientation: Orientation = "horizontal",
  point: Point = { x: 0, y: 0 }
): [Point, RefObject<HTMLDivElement>, (newTranslate: Point) => void] => {
  const [translate, setTranslate] = useState<Point>(point);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const observer = new ResizeObserver((entries) => {
      // Calculate dimensions relative to tree element container
      if (containerRef.current) {
        const { width, height } = window.document.body.getBoundingClientRect();
        setTranslate({
          x: width / 2,
          y: orientation === "vertical" ? 100 : height / 4,
        });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [orientation]);
  // @ts-ignore Callback ref element
  return [translate, containerRef, setTranslate];
};
