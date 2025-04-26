import { useLive2DStore } from '@/store'
import { useRef, useEffect } from 'react'
interface UseLive2DModelProps {
  width: number
  height: number
}

const modelPath = 'assets/live2d/whitecat/model.json'

export const useLive2DModel = ({ width, height }: UseLive2DModelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<Application | null>(null)
  const modelRef = useRef<Live2DModel | null>(null)
  const { setModel, speakAssetsAudio, assetsAudio } = useLive2DStore()

  useEffect(() => {
    if (!canvasRef.current) {
      console.error('Canvas not found')
      return
    }

    const init = async () => {
      const app = new window.PIXI.Application({
        width: width,
        height: height,
        transparent: true,
        backgroundAlpha: 0,
        view: canvasRef.current,
        autoDensity: true,
        resolution: window.devicePixelRatio * 2,
      })

      appRef.current = app

      const model = await window.PIXI.live2d.Live2DModel.from(modelPath)

      setModel(model)

      modelRef.current = model

      const modelWidth = model.width
      const modelHeight = model.height
      const scaleX = width / modelWidth
      const scaleY = height / modelHeight
      const scale = Math.min(scaleX, scaleY)

      model.x = width / 2
      model.y = height / 2
      model.scale.set(scale)

      model.anchor.set(0.5, 0.5)

      app.stage.addChild(model)

      model.expression('魔法棒')
    }

    init()
  }, [width, height])


  // Tips user to rest
  useEffect(() => {
    const checkTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()

      if ((hours === 23 && (minutes === 0 || minutes === 30 || minutes === 59)) ||
        hours === 1 ||
        hours === 2) {
        speakAssetsAudio(assetsAudio.rest)

      }
    }

    const handleTimeout = setInterval(checkTime, 30000)

    return () => {
      clearInterval(handleTimeout)
    }
  }, [speakAssetsAudio, assetsAudio])

  return {
    canvasRef,
    model: modelRef.current,
  }
}
