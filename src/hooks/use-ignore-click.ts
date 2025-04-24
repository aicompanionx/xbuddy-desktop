import { useEffect } from 'react'

import { CLASSNAME } from '@/constants/classname'
import { WINDOWS_ID } from '@/constants/windowsId'

const mouseMoveListener = (e: MouseEvent) => {
<<<<<<< HEAD
  // Check if the target element or any of its parents has the ignore class
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
=======
    if (e.target instanceof HTMLElement && (e.target.className.includes(CLASSNAME.IGNORE_MOUSE_EVENTS) || IGNORE_MOUSE_EVENTS_NODE_NAME.includes(e.target.nodeName.toUpperCase()))) {
        window.electronAPI.toggleIgnoreMouseEvents({ ignore: false, windowId: WINDOWS_ID.MAIN, forward: true })
    } else {
        window.electronAPI.toggleIgnoreMouseEvents({ ignore: true, windowId: WINDOWS_ID.MAIN, forward: true })
>>>>>>> d9f523f (feat: Live2D model)
    }

    // Handle SVGElement
    if (element instanceof SVGElement) {
      const parent = element.parentElement || element.closest(`.${CLASSNAME.IGNORE_MOUSE_EVENTS}`)
      if (parent) return hasIgnoreClass(parent)
    }

    return element.parentElement ? hasIgnoreClass(element.parentElement) : false
  }

  if ((e.target instanceof HTMLElement || e.target instanceof SVGElement) && hasIgnoreClass(e.target as Element)) {
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
