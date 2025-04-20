import { useState, useEffect, RefObject } from 'react'

interface Live2DDragOptions {
  canvasRef: RefObject<HTMLCanvasElement>
  enabled?: boolean // Add enable/disable option
}

interface Live2DDragResult {
  isDragging: boolean
  position: { x: number; y: number }
  setEnabled: (enabled: boolean) => void // Add enable/disable method
}

/**
 * Hook for managing internal dragging of Live2D models
 * Note: This functionality is temporarily disabled to avoid conflicts with window dragging
 */
export const useLive2DDrag = ({ canvasRef, enabled = false }: Live2DDragOptions): Live2DDragResult => {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isEnabled, setIsEnabled] = useState(enabled)

  useEffect(() => {
    if (!canvasRef.current || !isEnabled) return

    const canvas = canvasRef.current

    const handleMouseDown = (e: MouseEvent) => {
      // Check if Ctrl key is pressed - if so, don't handle dragging, let external window dragging take over
      if (e.ctrlKey) return

      // Prevent event bubbling to avoid triggering outer container dragging
      e.stopPropagation()

      setIsDragging(true)
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      // Prevent event bubbling
      e.stopPropagation()

      // Model internal dragging logic (temporarily empty)
      // Add code to adjust Live2D model position when actually using this

      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return

      // Prevent event bubbling
      e.stopPropagation()

      setIsDragging(false)
    }

    // Due to current conflicts with window dragging, we temporarily don't add any event listeners
    // canvas.addEventListener('mousedown', handleMouseDown)
    // document.addEventListener('mousemove', handleMouseMove)
    // document.addEventListener('mouseup', handleMouseUp)

    return () => {
      // Similarly, no need to remove listeners that weren't added
      // canvas.removeEventListener('mousedown', handleMouseDown)
      // document.removeEventListener('mousemove', handleMouseMove)
      // document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [canvasRef, isDragging, isEnabled])

  return {
    isDragging,
    position,
    setEnabled: setIsEnabled
  }
} 