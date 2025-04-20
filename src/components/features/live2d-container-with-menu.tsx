import { useState, useRef, useEffect } from 'react'
import { Live2DContainer } from './live2d-container'
import { Live2DMenu } from './live2d-menu'

interface Live2DContainerWithMenuProps {
  windowId: string
  modelPath: string
  width?: number
  height?: number
  autoResize?: boolean
  fullscreen?: boolean
}

export function Live2DContainerWithMenu({
  windowId,
  modelPath,
  width,
  height,
  autoResize,
  fullscreen,
}: Live2DContainerWithMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    setIsHovering(true)

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }

    hoverTimerRef.current = setTimeout(() => {
      setMenuVisible(true)
    }, 500)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }

    setTimeout(() => {
      if (!isHovering) {
        setMenuVisible(false)
      }
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  const handleClose = () => {
    window.electronAPI.sendMessageToWindow('main', 'close-live2d-window', { windowId })
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleTakeScreenshot = () => {
    window.electronAPI
      .captureScreenshot()
      .then((imagePath: string) => {
        console.log('Screenshot saved:', imagePath)
      })
      .catch((err: Error) => {
        console.error('Failed to take screenshot:', err)
      })
  }

  const handleOpenSettings = () => {
    window.electronAPI.sendMessageToWindow('main', 'open-live2d-settings', { windowId })
  }

  const handleMinimize = () => {
    window.electronAPI.sendMessageToWindow('main', 'minimize-live2d-window', { windowId })
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Live2DContainer
        windowId={windowId}
        modelPath={modelPath}
        width={width}
        height={height}
        autoResize={autoResize}
        fullscreen={fullscreen}
      />

      {(menuVisible || isHovering) && (
        <Live2DMenu
          onClose={handleClose}
          onRefresh={handleRefresh}
          onTakeScreenshot={handleTakeScreenshot}
          onOpenSettings={handleOpenSettings}
          onMinimize={handleMinimize}
        />
      )}
    </div>
  )
}
