import React, { useEffect, useRef, ReactNode } from 'react'

interface TransparentBackgroundProps {
  children: ReactNode
  className?: string
  onReady?: () => void
}

/**
 * Transparent Background Component
 *
 * Sets up the document to have a fully transparent background.
 * Ensures proper styling for child elements to appear in a transparent window.
 */
export const TransparentBackground: React.FC<TransparentBackgroundProps> = ({ children, className = '', onReady }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Set transparent background for entire document and handle cleanup
  useEffect(() => {
    // Set body and html background to transparent
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'

    // Ensure full screen styles
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.width = '100vw'
    document.body.style.height = '100vh'
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.width = '100vw'
    document.documentElement.style.height = '100vh'

    // Force any parent containers to be full size
    const parentElements: HTMLElement[] = []
    let parent = containerRef.current?.parentElement
    while (parent && parent !== document.body) {
      parentElements.push(parent)
      parent = parent.parentElement
    }

    parentElements.forEach((el) => {
      if (el) {
        el.style.width = '100%'
        el.style.height = '100%'
        el.style.margin = '0'
        el.style.padding = '0'
        el.style.overflow = 'hidden'
      }
    })

    // 确保鼠标事件能够正确工作
    document.body.style.pointerEvents = 'auto'
    document.documentElement.style.pointerEvents = 'auto'

    // Ensure DOM is fully ready before notifying
    const timer = setTimeout(() => {
      if (onReady) onReady()
    }, 100)

    return () => {
      // Cleanup function
      document.body.style.background = ''
      document.documentElement.style.background = ''
      document.body.style.margin = ''
      document.body.style.padding = ''
      document.body.style.overflow = ''
      document.body.style.width = ''
      document.body.style.height = ''
      document.body.style.pointerEvents = ''
      document.documentElement.style.margin = ''
      document.documentElement.style.padding = ''
      document.documentElement.style.overflow = ''
      document.documentElement.style.width = ''
      document.documentElement.style.height = ''
      document.documentElement.style.pointerEvents = ''

      // Restore parent elements
      parentElements.forEach((el) => {
        if (el) {
          el.style.width = ''
          el.style.height = ''
          el.style.margin = ''
          el.style.padding = ''
          el.style.overflow = ''
        }
      })

      clearTimeout(timer)
    }
  }, [onReady])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-transparent ${className}`}
      style={{ pointerEvents: 'auto' }} // 确保事件不被阻断
    >
      {children}
    </div>
  )
}
