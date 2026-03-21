import { useEffect, useState } from "react";

interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    let frame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        setMousePosition({ x: event.clientX, y: event.clientY });
        frame = 0;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return mousePosition;
}
