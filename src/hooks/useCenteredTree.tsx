import { RefObject, useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const observer = new ResizeObserver((entries) => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
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
