import React, { useRef, useState, memo } from 'react'
import Live2DCharacter from './live2d-character'
import { useLive2DDrag } from '@/pages/live2d/hooks/use-live2d-drag'
import { Live2DInputMenu } from './live2d-input-menu'
import { Live2DAlerts } from './live2d-alerts'
import { useAlert } from '@/contexts/alert-context'
import NewsAlert from '../show-alert/news-alert'

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
  const { isDragging } = useLive2DDrag(containerRef)
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

    if (state.activeAlert) {
      closeAlert()
      return
    }

    setMenuOpen(true)
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

  return (
    <div ref={containerRef} style={containerStyle} onAuxClick={handleContainerClick} onContextMenu={handleContextMenu}>
      <Live2DAlerts containerRef={containerRef} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <Live2DInputMenu containerRef={containerRef} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* News alert component */}
      <NewsAlert referenceElement={containerRef} />

      <Live2DCharacter windowId={windowId} width={width} height={height} centerModel={true} />
    </div>
  )
})

export default Live2DContainer
