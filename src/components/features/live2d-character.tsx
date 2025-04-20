import React, { useRef, useEffect } from 'react'
import { useLive2DModel } from '../../hooks/use-live2d-model'
import { CLASSNAME } from '@/constants/classname'

interface Live2DCharacterProps {
  windowId: string
  modelPath: string
  width: number
  height: number
  centerModel?: boolean
}

const Live2DCharacter: React.FC<Live2DCharacterProps> = ({ modelPath, width, height, centerModel = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Use Live2D model management hook
  const { model } = useLive2DModel({
    modelPath,
    width: width,
    height: height,
    canvasRef: canvasRef,
  })

  // Center the model in the canvas
  useEffect(() => {
    if (centerModel && model && canvasRef.current) {
      try {
        // Center model - this is a basic method that may need to be adjusted based on specific Live2D model implementation
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.resetTransform()
          ctx.translate(canvas.width / 2, canvas.height / 2)
        }
      } catch (err) {
        console.error('Failed to center model:', err)
      }
    }
  }, [model, centerModel, width, height])

  // Set Canvas style to ensure proper display size
  const canvasStyle = {
    width: width,
    height: height,
    zIndex: 100,
  } as React.CSSProperties

  return (
    <canvas
      ref={canvasRef}
      className={CLASSNAME.IGNORE_MOUSE_EVENTS}
      width={width}
      height={height}
      style={canvasStyle}
    ></canvas>
  )
}

export default Live2DCharacter
