import React, { useRef, memo, useEffect } from 'react'
import Live2DCharacter from './live2d-character'
import { useLive2DDrag } from '@/pages/live2d/hooks/use-live2d-drag'
import { Live2DChatAndMenu } from './live2d-chat-and-menu'
import { Live2DAlerts } from './live2d-alerts'
import { useAlert } from '@/contexts/alert-context'
import { useLive2DMenu } from '@/contexts/live2d-menu-context'
import { useLive2D } from '@/contexts/live2d-context'
import { storageUtil } from '@/utils/storage'

const width = 300
const height = 500

export const Live2DContainer = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isRaidStatusOpen, raidStatusContainerRef, inputContainerRef } = useLive2D()
  const { isMenuOpen, setIsMenuOpen } = useLive2DMenu()

  const containerRefToAlert = isRaidStatusOpen ? raidStatusContainerRef : isMenuOpen ? inputContainerRef : containerRef

  const { getLive2DPosition } = storageUtil()

  const live2dPosition = getLive2DPosition({ x: 0, y: 0 })

  // Use drag hook
  const { isDraggingMenu } = useLive2DDrag(containerRef)
  const { state, closeAlert } = useAlert()

  // Container style - make it completely transparent
  const containerStyle = {
    position: 'relative',
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(${live2dPosition.x}px, ${live2dPosition.y}px)`,
    background: 'transparent',
  } as React.CSSProperties

  // Handle right-click to show the input dialog
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent default context menu
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (state.activeAlert) {
      closeAlert()
    }

    setIsMenuOpen(true)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isDraggingMenu && isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [isDraggingMenu, isMenuOpen])

  return (
    <div
      id="live2d-container"
      ref={containerRef}
      style={containerStyle}
      onContextMenu={handleContextMenu}
      onAuxClick={handleContainerClick}
    >
      <Live2DAlerts containerRef={containerRefToAlert} menuOpen={isMenuOpen} />
      <Live2DChatAndMenu containerRef={containerRef} />
      <Live2DCharacter width={width} height={height} />
    </div>
  )
})

export default Live2DContainer
