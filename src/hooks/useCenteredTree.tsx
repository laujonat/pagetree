import { RefObject, useCallback, useState } from "react";

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

  // Use a callback ref to set the translate state based on the container dimensions
  const containerRef = useCallback(
    (containerElem: HTMLDivElement | null) => {
      if (containerElem) {
        const { width, height } = containerElem.getBoundingClientRect();
        setTranslate({
          x: orientation === "vertical" ? width : width / 2,
          y: orientation === "vertical" ? 100 : height / 2,
        });
      }
    },
    [orientation]
  );

  // @ts-ignore Callback ref element
  return [translate, containerRef, setTranslate];
};
