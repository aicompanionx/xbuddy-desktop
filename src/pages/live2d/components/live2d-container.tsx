import React, { useRef, useState, memo, useEffect } from 'react'
import Live2DCharacter from './live2d-character'
import { useLive2DDrag } from '@/pages/live2d/hooks/use-live2d-drag'
import { Live2DInputMenu } from './live2d-input-menu'
import { Live2DAlerts } from './live2d-alerts'
import { useAlert } from '@/contexts/alert-context'

interface Live2DContainerProps {
  windowId: string
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
  autoResize?: boolean
  fullscreen?: boolean
}

export const Live2DContainer = memo(({ windowId, width = 300, height = 400 }: Live2DContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Use drag hook
  const { isDragging, isDraggingMenu } = useLive2DDrag(containerRef)
  const { state, closeAlert } = useAlert()

  // Container style - make it completely transparent
  const containerStyle = {
    position: 'relative',
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(${window.innerWidth - width}px, ${window.innerHeight - height}px)`,
    background: 'transparent',
  } as React.CSSProperties

  // Handle right-click to show the input dialog
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent default context menu
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    if (isDragging) return
    e.stopPropagation()

    if (state.activeAlert) {
      closeAlert()
      return
    }

    setMenuOpen(true)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isDraggingMenu && menuOpen) {
      setMenuOpen(false)
    }
  }, [isDraggingMenu, menuOpen])

  return (
    <div
      id="live2d-container"
      ref={containerRef}
      style={containerStyle}
      onContextMenu={handleContextMenu}
      onAuxClick={handleContainerClick}
    >
      <Live2DAlerts containerRef={containerRef} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <Live2DInputMenu containerRef={containerRef} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <Live2DCharacter windowId={windowId} width={width} height={height} centerModel={true} />
    </div>
  )
})

export default Live2DContainer
