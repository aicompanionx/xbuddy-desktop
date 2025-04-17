import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to monitor screen resizing and provide dynamic dimension values
 * @param initialWidth Initial width
 * @param initialHeight Initial height
 * @param scaleWithWindow Whether to scale with the window (true uses window size ratio, false uses initial values)
 * @returns Current dimensions and function to update dimensions
 */
export function useScreenResize(
  initialWidth: number,
  initialHeight: number,
  scaleWithWindow = true
) {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  })

  // Calculate scaled dimensions
  const calculateSize = useCallback(() => {
    if (!scaleWithWindow) {
      return { width: initialWidth, height: initialHeight }
    }
    
    // Get window dimensions
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    
    // Set minimum size limits to ensure canvas isn't too small
    const MIN_WIDTH = 500
    const MIN_HEIGHT = 400
    
    // Calculate scale ratio based on window size
    // Use a larger ratio to make the model display larger
    const scale = Math.min(windowWidth / 1920, windowHeight / 1080) * 1.5 // Increase by 1.5x
    
    // Calculate initial dimensions
    let calculatedWidth = Math.round(initialWidth * scale)
    let calculatedHeight = Math.round(initialHeight * scale)
    
    // Apply minimum size limits
    calculatedWidth = Math.max(calculatedWidth, MIN_WIDTH)
    calculatedHeight = Math.max(calculatedHeight, MIN_HEIGHT)
    
    // Consider actual window size to avoid overflow
    calculatedWidth = Math.min(calculatedWidth, windowWidth * 0.9)
    calculatedHeight = Math.min(calculatedHeight, windowHeight * 0.9)
    
    return {
      width: calculatedWidth,
      height: calculatedHeight,
    }
  }, [initialWidth, initialHeight, scaleWithWindow])

  // Handler function to update dimensions
  const updateDimensions = useCallback(() => {
    setDimensions(calculateSize())
  }, [calculateSize])
  
  // Method to manually update dimensions
  const setCustomDimensions = useCallback((width: number, height: number) => {
    setDimensions({ width, height })
  }, [])

  // Listen for window size changes
  useEffect(() => {
    updateDimensions() // Calculate once on initialization
    
    // Add resize event listener
    window.addEventListener('resize', updateDimensions)
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [updateDimensions])

  return {
    ...dimensions,
    setDimensions: setCustomDimensions,
    updateDimensions
  }
} 