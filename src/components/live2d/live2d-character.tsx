import { forwardRef, memo } from 'react'
import { useLive2DModel } from '../../hooks/use-live2d-model'
import { CLASSNAME } from '@/constants/classname'

interface Live2DCharacterProps {
  windowId: string
  width: number
  height: number
  centerModel?: boolean
}

const Live2DCharacter = memo(
  forwardRef<HTMLCanvasElement, Live2DCharacterProps>(({ width, height }) => {
    // Use Live2D model management hook
    const { canvasRef } = useLive2DModel({
      width: width,
      height: height,
    })

    // Attach the forwarded ref to the canvas element
    return <canvas ref={canvasRef} className={CLASSNAME.IGNORE_MOUSE_EVENTS} width={width} height={height}></canvas>
  }),
)

Live2DCharacter.displayName = 'Live2DCharacter'

export default Live2DCharacter
