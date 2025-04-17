import React, { useRef, useEffect } from 'react'
import { useLive2DModel } from '../../hooks/use-live2d-model'
import { useLive2DDrag } from '../../hooks/use-live2d-drag'
import { useScreenResize } from '../../hooks/use-screen-resize'

interface Live2DCharacterProps {
  modelPath: string
  width?: number
  height?: number
  autoResize?: boolean
  fullscreen?: boolean
  centerModel?: boolean
}

const Live2DCharacter: React.FC<Live2DCharacterProps> = ({ 
  modelPath, 
  width = 800,
  height = 600,
  autoResize = true,
  fullscreen = false,
  centerModel = false
}) => {
  const containerRef = useRef<HTMLCanvasElement>(null)
  
  // Use screen size monitoring hook
  const { width: resizedWidth, height: resizedHeight } = useScreenResize(width, height, autoResize)
  
  // Use Live2D model management hook
  const { isLoading, loadError, model, updateModelSize } = useLive2DModel({
    modelPath,
    width,
    height,
    canvasRef: containerRef
  })
  
  // Use drag management hook
  const { isDragging, position } = useLive2DDrag({
    canvasRef: containerRef
  })
  
  // Update model size when screen size changes
  useEffect(() => {
    if (resizedWidth !== width || resizedHeight !== height) {
      updateModelSize(resizedWidth, resizedHeight)
    }
  }, [resizedWidth, resizedHeight, width, height, updateModelSize])

  // Center the model in the canvas
  useEffect(() => {
    if (centerModel && model && containerRef.current) {
      try {
        // Center the model - this is a basic approach and might need to be adjusted 
        // based on the specific Live2D model implementation
        const canvas = containerRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.resetTransform();
          ctx.translate(canvas.width / 2, canvas.height / 2);
        }
      } catch (err) {
        console.error('Failed to center model:', err);
      }
    }
  }, [model, centerModel, resizedWidth, resizedHeight]);

  // Set container style - make it fully transparent
  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'transparent'
  } as React.CSSProperties

  // Set Canvas style to ensure proper display size
  const canvasStyle = {
    touchAction: 'none', // Prevent touch events from interfering with drag
    width: fullscreen || centerModel ? '100%' : resizedWidth,
    height: fullscreen || centerModel ? '100%' : resizedHeight, 
    display: 'block',
    margin: '0 auto', // Center the canvas
    background: 'transparent',
    position: fullscreen || centerModel ? 'absolute' : 'relative',
    top: fullscreen || centerModel ? '50%' : 'auto',
    left: fullscreen || centerModel ? '50%' : 'auto',
    transform: fullscreen || centerModel ? 'translate(-50%, -50%)' : 'none',
  } as React.CSSProperties

  return (
    <div style={containerStyle}>
      {loadError && (
        <div className="p-2 bg-red-600 text-white text-sm z-50 absolute top-0 left-0 right-0">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-40">
          <div className="bg-black bg-opacity-50 px-4 py-2 rounded-md">
            Loading model...
          </div>
        </div>
      )}
      <canvas 
        ref={containerRef} 
        width={resizedWidth} 
        height={resizedHeight}
        style={canvasStyle}
      ></canvas>
    </div>
  )
}

export default Live2DCharacter
