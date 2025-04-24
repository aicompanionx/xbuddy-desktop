import React from 'react'
import { useLive2DModel } from '../../pages/live2d/hooks/use-live2d-model'
import { CLASSNAME } from '@/constants/classname'

interface Live2DCharacterProps {
  windowId: string
  width: number
  height: number
  centerModel?: boolean
}

const Live2DCharacter: React.FC<Live2DCharacterProps> = ({ width, height }) => {
  // Use Live2D model management hook
  const { canvasRef } = useLive2DModel({
    width: width,
    height: height,
  })

  return <canvas ref={canvasRef} className={CLASSNAME.IGNORE_MOUSE_EVENTS} width={width} height={height}></canvas>
}

export default Live2DCharacter
