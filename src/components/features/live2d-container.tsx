import React from 'react'
import Live2DCharacter from './live2d-character'

interface Live2DContainerProps {
  windowId: string
  modelPath: string
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
  autoResize?: boolean
  fullscreen?: boolean
}

export const Live2DContainer: React.FC<Live2DContainerProps> = ({
  windowId,
  modelPath,
  width = 300,
  height = 400,
  autoResize = true,
  fullscreen = false,
}) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Live2DCharacter
        windowId={windowId}
        modelPath={modelPath}
        width={width}
        height={height}
        autoResize={autoResize}
        fullscreen={fullscreen}
        centerModel={true}
      />
    </div>
  )
}
