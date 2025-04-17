import React, { useState, useEffect, useRef, ReactNode } from 'react'

interface DraggableWindowProps {
  windowId: string
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * Draggable Window Component
 *
 * Provides window dragging functionality for transparent windows.
 * Handles mouse events and sends position updates to the main process.
 */
export const DraggableWindow: React.FC<DraggableWindowProps> = ({ windowId, children, className = '', style = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const dragHandlerRef = useRef<((e: MouseEvent) => void) | undefined>(undefined)
  const dropHandlerRef = useRef<((e: MouseEvent) => void) | undefined>(undefined)

  // 初始化拖动处理函数
  useEffect(() => {
    // 全局鼠标移动处理函数
    dragHandlerRef.current = (e: MouseEvent) => {
      if (!isDragging) return

      // 阻止事件传播以避免干扰
      e.preventDefault()
      e.stopPropagation()

      // 计算移动增量
      const deltaX = e.clientX - dragOffset.x
      const deltaY = e.clientY - dragOffset.y

      // 更新拖动起始坐标
      setDragOffset({
        x: e.clientX,
        y: e.clientY,
      })

      // 向主进程发送窗口移动消息
      window.electronAPI.sendMessageToWindow('main', 'move-live2d-window', {
        x: deltaX,
        y: deltaY,
        windowId,
      })
    }

    // 全局鼠标抬起处理函数
    dropHandlerRef.current = (e: MouseEvent) => {
      setIsDragging(false)

      // 移除全局事件监听
      if (dragHandlerRef.current) {
        document.removeEventListener('mousemove', dragHandlerRef.current, true)
      }
      if (dropHandlerRef.current) {
        document.removeEventListener('mouseup', dropHandlerRef.current, true)
      }
    }
  }, [isDragging, dragOffset, windowId])

  // 处理拖动开始
  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('拖动开始')

    // 阻止事件传播
    e.preventDefault()
    e.stopPropagation()

    // 设置拖动状态
    setIsDragging(true)
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
    })

    // 注册全局事件监听器，使用捕获模式确保不会被其他元素阻止
    if (dragHandlerRef.current) {
      document.addEventListener('mousemove', dragHandlerRef.current, true)
    }
    if (dropHandlerRef.current) {
      document.addEventListener('mouseup', dropHandlerRef.current, true)
    }
  }

  // 确保组件卸载时清理全局事件监听器
  useEffect(() => {
    return () => {
      if (dragHandlerRef.current) {
        document.removeEventListener('mousemove', dragHandlerRef.current, true)
      }
      if (dropHandlerRef.current) {
        document.removeEventListener('mouseup', dropHandlerRef.current, true)
      }
    }
  }, [])

  // 添加拖动触发键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl键触发拖动模式
      if (e.key === 'Control') {
        console.log('进入拖动模式')
        document.body.style.cursor = 'grab'
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        console.log('退出拖动模式')
        document.body.style.cursor = ''
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-screen h-screen overflow-hidden bg-transparent ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${className}`}
      style={{
        background: 'transparent',
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        userSelect: 'none', // 防止文本选择
        ...style,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 顶部、左侧和右侧拖动区域 */}
      <div
        className="absolute top-0 left-0 right-0 h-16 z-50 bg-transparent"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
      />
      <div
        className="absolute top-16 left-0 bottom-0 w-16 z-50 bg-transparent"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
      />
      <div
        className="absolute top-16 right-0 bottom-0 w-16 z-50 bg-transparent"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
      />

      {/* 调试信息 - 仅在开发环境显示 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 right-0 p-2 bg-black bg-opacity-50 text-white text-xs z-[100] pointer-events-none">
          拖动状态: {isDragging ? '拖动中' : '未拖动'}
          <br />
          坐标: {dragOffset.x}, {dragOffset.y}
        </div>
      )}

      {children}
    </div>
  )
}
