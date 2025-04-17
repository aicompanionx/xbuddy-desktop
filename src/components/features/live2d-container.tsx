import React, { useState, useEffect } from 'react'
import { TransparentBackground } from './transparent-background'
import { DraggableWindow } from './draggable-window'
import { ErrorBoundary } from './error-boundary'
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

/**
 * Live2D Container Component
 *
 * 集成Live2D模型显示、透明背景和窗口拖动功能
 */
export const Live2DContainer: React.FC<Live2DContainerProps> = ({
  windowId,
  modelPath,
  className = '',
  style = {},
  width = 300,
  height = 400,
  autoResize = true,
  fullscreen = false,
}) => {
  const [isReady, setIsReady] = useState(false)

  // 通知主进程容器已准备就绪
  useEffect(() => {
    if (isReady) {
      window.electronAPI.sendMessageToWindow('main', 'live2d-container-ready', { windowId })
    }
  }, [isReady, windowId])

  // 错误处理
  const handleError = () => {
    console.error('Live2D container encountered an error')
    window.electronAPI.sendMessageToWindow('main', 'live2d-container-error', { windowId })
  }

  return (
    <ErrorBoundary onError={handleError}>
      <TransparentBackground onReady={() => setIsReady(true)}>
        <DraggableWindow windowId={windowId} className={className} style={style}>
          <div className="flex items-center justify-center w-full h-full">
            <Live2DCharacter
              modelPath={modelPath}
              width={width}
              height={height}
              autoResize={autoResize}
              fullscreen={fullscreen}
              centerModel={true}
            />
          </div>
        </DraggableWindow>
      </TransparentBackground>
    </ErrorBoundary>
  )
}
