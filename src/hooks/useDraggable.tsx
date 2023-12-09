import { useEffect, useState } from "react";

export const useDraggable = (ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    console.log("REF CURRENT", ref.current);
    const handleMouseDown = (event) => {
      if (ref.current) {
        ref.current.style.cursor = "grabbing"; // Change body cursor
      }
      setIsDragging(true);
      setOrigin({
        x: event.clientX,
        y: event.clientY,
      });
    };

    const handleMouseOver = (event) => {
      if (ref.current) return;
      event.stopPropagation();
    };
    const handleMouseOut = (event) => {
      if (ref.current) return;
      event.stopPropagation();
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;
      const deltaX = event.clientX - origin.x;
      const deltaY = event.clientY - origin.y;
      setOrigin({ x: event.clientX, y: event.clientY });

      if (ref.current) {
        ref.current.scrollLeft -= deltaX;
        ref.current.scrollTop -= deltaY;
      }
    };

    const handleMouseUp = (event) => {
      if (ref.current) {
        ref.current.style.cursor = "default"; // Change body cursor back to default
      }
      setIsDragging(false);
      event.stopPropagation();
    };

    if (ref.current) {
      ref.current.addEventListener("mousedown", handleMouseDown, true);
    }
    ref.current.addEventListener("mousemove", handleMouseMove, true);
    ref.current.addEventListener("mouseup", handleMouseUp, true);
    ref.current.addEventListener("mouseover", handleMouseOver, true);
    ref.current.addEventListener("mouseout", handleMouseOut, true);

    return () => {
      if (ref.current) {
        ref.current.removeEventListener("mousedown", handleMouseDown, true);
        ref.current.removeEventListener("mousemove", handleMouseMove, true);
        ref.current.removeEventListener("mouseup", handleMouseUp, true);
        ref.current.removeEventListener("mouseover", handleMouseOver, true);
        ref.current.removeEventListener("mouseout", handleMouseOut, true);
      }
    };
  }, [ref, isDragging, origin]);

  return { isDragging };
};

export default useDraggable;
