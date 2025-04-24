import { useRef, useEffect } from 'react'
interface UseLive2DModelProps {
  width: number
  height: number
}

const modelPath = 'assets/live2d/whitecat/model.json'

export const useLive2DModel = ({
  width,
  height,
}: UseLive2DModelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const appRef = useRef<Application | null>(null)
  const modelRef = useRef<Live2DModel | null>(null)


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

      const model = await window.PIXI.live2d.Live2DModel.from(modelPath);

      modelRef.current = model

      const modelWidth = model.width;
      const modelHeight = model.height;
      const scaleX = width / modelWidth;
      const scaleY = height / modelHeight;
      const scale = Math.min(scaleX, scaleY);

      model.x = width / 2;
      model.y = height / 2;
      model.scale.set(scale);

      model.anchor.set(0.5, 0.5);

      app.stage.addChild(model)


      canvasRef.current.addEventListener('mouseenter', () => {
        const audio_link = "assets/audio/test.mp3"
        const volume = 0.6;

        model.speak(audio_link, {
          volume: volume,
          resetExpression: true,
          expression: null,
          onFinish: () => {
            console.log('finish')
          },
          onError: (err: any) => { console.log("Error: " + err) } // [if any error occurs]
        })
      })
    }

    init()

  }, [width, height])


  return {
    canvasRef,
    model: modelRef.current,
  }
}
