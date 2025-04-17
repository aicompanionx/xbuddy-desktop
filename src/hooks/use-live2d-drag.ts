import { useState, useEffect, RefObject } from 'react'

interface Live2DDragOptions {
  canvasRef: RefObject<HTMLCanvasElement>
  enabled?: boolean // 添加启用/禁用选项
}

interface Live2DDragResult {
  isDragging: boolean
  position: { x: number; y: number }
  setEnabled: (enabled: boolean) => void // 添加启用/禁用方法
}

/**
 * 钩子用于管理Live2D模型的内部拖动
 * 注意：暂时禁用此功能，以避免与窗口拖动冲突
 */
export const useLive2DDrag = ({ canvasRef, enabled = false }: Live2DDragOptions): Live2DDragResult => {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isEnabled, setIsEnabled] = useState(enabled)

  useEffect(() => {
    if (!canvasRef.current || !isEnabled) return

    const canvas = canvasRef.current

    const handleMouseDown = (e: MouseEvent) => {
      // 检查是否按下了Ctrl键 - 如果按下，则不处理拖动，让外部窗口拖动功能接管
      if (e.ctrlKey) return

      // 阻止事件冒泡，避免触发外层容器的拖动
      e.stopPropagation()

      setIsDragging(true)
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      // 阻止事件冒泡
      e.stopPropagation()

      // 模型内部的拖动逻辑（暂时为空）
      // 实际使用时在这里添加调整Live2D模型位置的代码

      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return

      // 阻止事件冒泡
      e.stopPropagation()

      setIsDragging(false)
    }

    // 由于当前与窗口拖动冲突，我们暂时不添加任何事件监听器
    // canvas.addEventListener('mousedown', handleMouseDown)
    // document.addEventListener('mousemove', handleMouseMove)
    // document.addEventListener('mouseup', handleMouseUp)

    return () => {
      // 同样，不需要移除未添加的监听器
      // canvas.removeEventListener('mousedown', handleMouseDown)
      // document.removeEventListener('mousemove', handleMouseMove)
      // document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [canvasRef, isDragging, isEnabled])

  return {
    isDragging,
    position,
    setEnabled: setIsEnabled
  }
} 