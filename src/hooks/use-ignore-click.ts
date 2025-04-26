import { useEffect } from 'react'

import { CLASSNAME } from '@/constants/classname'
import { WINDOWS_ID } from '@/constants/windowsId'

const mouseMoveListener = (e: MouseEvent) => {
  // Check if the element has a class that ignores mouse events
  const hasIgnoreClass = (element: Element): boolean => {
    if (!element) return false

    // Handle HTMLElement
    if (
      element instanceof HTMLElement &&
      element.className &&
      typeof element.className === 'string' &&
      element.className.includes(CLASSNAME.IGNORE_MOUSE_EVENTS)
    ) {
      return true
    }

    // Handle SVGElement
    if (element instanceof SVGElement) {
      const parent = element.parentElement || element.closest(`.${CLASSNAME.IGNORE_MOUSE_EVENTS}`)
      if (parent) return hasIgnoreClass(parent)
    }

    return element.parentElement ? hasIgnoreClass(element.parentElement) : false
  }

  // Check if the clicked position in Canvas is a transparent area
  const isTransparentPixel = (canvas: HTMLCanvasElement, x: number, y: number): boolean => {
    try {
      const rect = canvas.getBoundingClientRect()
      const canvasX = x - rect.left
      const canvasY = y - rect.top

      // Get pixel data at the clicked position
      const ctx = canvas.getContext('2d')

      if (!ctx) return false

      const pixelData = ctx.getImageData(canvasX, canvasY, 1, 1).data
      // Check alpha channel value, if 0 then it's transparent
      console.log(pixelData, pixelData[3] === 0);

      return pixelData[3] === 0
    } catch (error) {
      console.error('Failed to get Canvas pixel data:', error)
      return false
    }
  }

  if (e.target instanceof HTMLCanvasElement) {
    // If it's a Canvas element, check if the clicked position is a transparent area
    const isTransparent = isTransparentPixel(e.target, e.clientX, e.clientY)

    console.log('isTransparent', isTransparent)

    window.electronAPI.toggleIgnoreMouseEvents({
      ignore: isTransparent,
      windowId: WINDOWS_ID.MAIN,
      forward: true
    })
  } else if ((e.target instanceof HTMLElement || e.target instanceof SVGElement) && hasIgnoreClass(e.target as Element)) {
    window.electronAPI.toggleIgnoreMouseEvents({ ignore: false, windowId: WINDOWS_ID.MAIN, forward: true })
  } else {
    window.electronAPI.toggleIgnoreMouseEvents({ ignore: true, windowId: WINDOWS_ID.MAIN, forward: true })
  }
}

export const useIgnoreClick = () => {
  useEffect(() => {
    window.addEventListener('mousemove', mouseMoveListener)
    return () => {
      window.removeEventListener('mousemove', mouseMoveListener)
    }
  }, [])
}
