import { WINDOWS_ID } from "@/constants/windowsId";
import { useEffect, useRef } from "react";

export const useLive2DDrag = (containerRef: React.RefObject<HTMLDivElement>) => {
  const isDraggingRef = useRef(false)
  const initialMousePositionRef = useRef({ x: 0, y: 0 })
  const translatePositionRef = useRef({ x: 0, y: 0 })

  // Function to parse transform translate values
  const parseTranslateValues = (element: HTMLElement): { x: number, y: number } => {
    const transform = window.getComputedStyle(element).getPropertyValue('transform');

    // Default to 0,0 if no transform or it's 'none'
    if (!transform || transform === 'none') {
      return { x: 0, y: 0 };
    }

    // For matrix(a, b, c, d, tx, ty) format, we want tx and ty (the 5th and 6th values)
    try {
      const matrixValues = transform.match(/matrix.*\((.+)\)/)?.[1].split(', ');
      if (matrixValues && matrixValues.length >= 6) {
        return {
          x: parseFloat(matrixValues[4]),
          y: parseFloat(matrixValues[5])
        };
      }
    } catch (e) {
      console.error('Error parsing transform values:', e);
    }

    return { x: 0, y: 0 };
  };

  // Handle mouse interactions for dragging
  useEffect(() => {
    // Start dragging when mouse is pressed on canvas
    const handleMouseDown = (e: any) => {
      if (e.target.parentElement === containerRef.current && containerRef.current) {
        isDraggingRef.current = true;

        // Store initial mouse position
        initialMousePositionRef.current = { x: e.clientX, y: e.clientY };

        // Get current transform position before first drag
        const currentTransform = parseTranslateValues(containerRef.current);
        translatePositionRef.current = currentTransform;
      }
    };

    // Handle mouse movement - directly move canvas element
    const handleMouseMove = (e: any) => {
      if (isDraggingRef.current && containerRef.current) {
        // Get viewport dimensions
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;

        // Limit mouse coordinates to viewport boundaries
        const limitedMouseX = Math.max(0, Math.min(e.clientX, viewportWidth));
        const limitedMouseY = Math.max(0, Math.min(e.clientY, viewportHeight));

        // Calculate mouse movement delta from initial position
        const deltaX = limitedMouseX - initialMousePositionRef.current.x;
        const deltaY = limitedMouseY - initialMousePositionRef.current.y;

        // Calculate new transform position
        const newX = translatePositionRef.current.x + deltaX;
        const newY = translatePositionRef.current.y + deltaY;

        // Enhanced viewport boundary detection
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Calculate boundary limits for viewport
        const minVisibleWidth = containerWidth;
        const minVisibleHeight = containerHeight;

        // Calculate boundary limits for viewport
        const boundedX = Math.max(-containerWidth + minVisibleWidth, Math.min(newX, viewportWidth - minVisibleWidth));
        const boundedY = Math.max(-containerHeight + minVisibleHeight, Math.min(newY, viewportHeight - minVisibleHeight));

        // Update element position using transform
        containerRef.current.style.transform = `translate(${boundedX}px, ${boundedY}px)`;

        // Update current position for next calculation
        translatePositionRef.current = { x: boundedX, y: boundedY };
        initialMousePositionRef.current = { x: limitedMouseX, y: limitedMouseY };
      }
    };

    // End dragging when mouse is released
    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
      }
    };

    // Add event listeners with passive option for better performance
    if (containerRef.current) {
      window.addEventListener('mousedown', handleMouseDown, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp, { passive: true });
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef.current]);

  return {
    isDragging: isDraggingRef.current,
    translatePosition: translatePositionRef.current,
  }
};
