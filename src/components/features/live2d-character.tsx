import React, { useRef, useEffect } from 'react'
import { useLive2DModel } from '../../hooks/use-live2d-model'
import { useScreenResize } from '../../hooks/use-screen-resize'

interface Live2DCharacterProps {
  windowId: string
  modelPath: string
  width?: number
  height?: number
  autoResize?: boolean
  fullscreen?: boolean
  centerModel?: boolean
}

const Live2DCharacter: React.FC<Live2DCharacterProps> = ({
  windowId,
  modelPath,
  width = 800,
  height = 600,
  autoResize = true,
  fullscreen = false,
  centerModel = false,
}) => {
  const containerRef = useRef<HTMLCanvasElement>(null)

  // Use screen size monitoring hook
  const { width: resizedWidth, height: resizedHeight } = useScreenResize(width, height, autoResize)

  // Use Live2D model management hook
  const { model } = useLive2DModel({
    modelPath,
    width: resizedWidth,
    height: resizedHeight,
    canvasRef: containerRef,
  })

  // Center the model in the canvas
  useEffect(() => {
    if (centerModel && model && containerRef.current) {
      try {
        // Center the model - this is a basic approach and might need to be adjusted
        // based on the specific Live2D model implementation
        const canvas = containerRef.current
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.resetTransform()
          ctx.translate(canvas.width / 2, canvas.height / 2)
        }
      } catch (err) {
        console.error('Failed to center model:', err)
      }
    }
  }, [model, centerModel, resizedWidth, resizedHeight])

  // Set container style - make it fully transparent
  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'transparent',
  } as React.CSSProperties

  // Set Canvas style to ensure proper display size
  const canvasStyle = {
    pointerEvents: 'auto', // Allow canvas to receive mouse events
    width: fullscreen || centerModel ? '100%' : resizedWidth,
    height: fullscreen || centerModel ? '100%' : resizedHeight,
    display: 'block',
    margin: '0 auto', // Center the canvas
    background: process.env.NODE_ENV === 'development' ? 'rgba(0,0,0,0.1)' : 'transparent',
    // position: fullscreen || centerModel ? 'absolute' : 'relative',
    // top: fullscreen || centerModel ? '50%' : 'auto',
    // left: fullscreen || centerModel ? '50%' : 'auto',
    // transform: fullscreen || centerModel ? 'translate(-50%, -50%)' : 'none',
    touchAction: 'none',
    zIndex: 100,
    border: process.env.NODE_ENV === 'development' ? '1px solid red' : 'none',
  } as React.CSSProperties
  return (
    <div style={containerStyle} className="live2d-container">
      <canvas ref={containerRef} width={resizedWidth} height={resizedHeight} style={canvasStyle}></canvas>
    </div>
  )
}

export default Live2DCharacter
