import { useCallback, useState } from "react";

export const useCenteredTree = (
  orientation = "horizontal",
  point = { x: 0, y: 0 }
) => {
  const [translate, setTranslate] = useState<{ x: number; y: number }>(point);
  console.log("orientation from centered", orientation);
  // Use a callback ref to set the translate state based on the container dimensions
  const containerRef: any = useCallback(
    (containerElem: HTMLDivElement | null) => {
      console.trace(containerElem);
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

  return [translate, containerRef];
};
