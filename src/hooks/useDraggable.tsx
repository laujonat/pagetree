import { useEffect, useState } from "react";

const useDraggable = (ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (ref.current) {
        ref.current.style.cursor = "grabbing";
      }
      setIsDragging(true);
      setOrigin({
        x: event.clientX,
        y: event.clientY,
      });
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

    const handleMouseUp = () => {
      if (ref.current) {
        ref.current.style.cursor = "grab";
      }
      setIsDragging(false);
    };

    if (ref.current) {
      ref.current.addEventListener("mousedown", handleMouseDown);
      ref.current.style.cursor = "grab";
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (ref.current) {
        ref.current.removeEventListener("mousedown", handleMouseDown);
        ref.current.style.cursor = "default";
      }
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [ref, isDragging, origin]);

  return { isDragging };
};

export default useDraggable;
