import { useCallback, useState } from "react";

export const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
  const [translate, setTranslate] = useState<{ x: number; y: number }>(
    defaultTranslate
  );
  // Use a callback ref to set the translate state based on the container dimensions
  const containerRef: any = useCallback(
    (containerElem: HTMLDivElement | null) => {
      console.trace(containerElem);
      if (containerElem) {
        const { width, height } = containerElem.getBoundingClientRect();
        console.info("w", width, "h", height);
        setTranslate({ x: width / 2, y: height / 2 });
      }
    },
    []
  );

  return [translate, containerRef];
};

// export const useCenteredDimensions = (refElement) => {
//   const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
//   useEffect(() => {
//     if (refElement !== null) {
//       const { x, y } = refElement.getBoundingClientRect();
//       setDimensions({ width: x / 2, height: y / 2 });
//     }
//   }, []);
//   return [dimensions];
// };
