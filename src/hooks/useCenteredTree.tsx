import { RefObject, useLayoutEffect, useRef, useState } from "react";
import { Point } from "react-d3-tree";

import { Dimension } from "../types";

type Orientation = "horizontal" | "vertical";

export const useCenteredTree = (
  orientation: Orientation = "horizontal",
  point: Point = { x: 0, y: 0 }
): [
  Point,
  Dimension | undefined,
  RefObject<HTMLDivElement>,
  (newTranslate: Point) => void
] => {
  const [translate, setTranslate] = useState<Point>(point);
  const [dimensions, setDimensions] = useState<Dimension>();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const observer = new ResizeObserver((entries) => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
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
  }, [orientation, containerRef]);

  return [translate, dimensions, containerRef, setTranslate];
};
