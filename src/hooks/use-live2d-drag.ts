import { useRef, useState, useEffect } from 'react'

interface Position {
  x: number
  y: number
}

interface UseDragOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function useLive2DDrag({ canvasRef }: UseDragOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const dragOffset = useRef<Position>({ x: 0, y: 0 })

  useEffect(() => {
    if (!canvasRef.current) return

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true)
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const newPosition = {
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      }

      setPosition(newPosition)

      // 通知Electron窗口移动
      if (window.electronAPI && window.electronAPI.sendMessageToWindow) {
        window.electronAPI.sendMessageToWindow('main', 'move-live2d-window', newPosition)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    canvasRef.current.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      canvasRef.current?.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [canvasRef, isDragging, position])

  return {
    isDragging,
    position,
  }
} 