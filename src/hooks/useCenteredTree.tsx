import React, { useCallback, useState } from "react";

type Point = {
  x: number;
  y: number;
};

type Orientation = "horizontal" | "vertical";

export const useCenteredTree = (
  orientation: Orientation = "horizontal",
  point: Point = { x: 0, y: 0 }
): [Point, React.RefObject<HTMLDivElement>, (newTranslate: Point) => void] => {
  const [translate, setTranslate] = useState<Point>(point);

  // Use a callback ref to set the translate state based on the container dimensions
  const containerRef = useCallback(
    (containerElem: HTMLDivElement | null) => {
      if (containerElem) {
        const { width, height } = containerElem.getBoundingClientRect();
        setTranslate({
          x: orientation === "vertical" ? width : width,
          y: orientation === "vertical" ? 100 : height,
        });
      }
    },
    [orientation]
  );

  // Return the state and the containerRef
  // @ts-ignore
  return [translate, containerRef, setTranslate]; // Include setTranslate in the return value
};
