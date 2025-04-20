import React, { useState, useEffect } from 'react'
import { cn } from '@/utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface CircularMenuItem {
  id: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

interface CircularMenuProps {
  items: CircularMenuItem[]
  isOpen?: boolean
  onToggle?: (isOpen: boolean) => void
  radius?: number
  className?: string
  itemClassName?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

/**
 * CircularMenu组件
 * 一个可以动态展开的圆形菜单，支持自定义位置和动画效果
 */
export function CircularMenu({
  items,
  isOpen = false,
  onToggle,
  radius = 100,
  className,
  itemClassName,
  position = 'center',
}: CircularMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(isOpen)

  // 同步外部isOpen状态
  useEffect(() => {
    setIsMenuOpen(isOpen)
  }, [isOpen])

  // 切换菜单状态
  const toggleMenu = () => {
    const newState = !isMenuOpen
    setIsMenuOpen(newState)
    onToggle?.(newState)
  }

  // 计算菜单项的位置
  const getItemPosition = (index: number) => {
    const angleStep = (2 * Math.PI) / items.length
    const angle = index * angleStep

    return isMenuOpen ? `rotate(${angle}rad) translate(${radius}px) rotate(${-angle}rad)` : 'translate(0, 0)'
  }

  return (
    <div className={cn('relative w-12 h-12', className)}>
      {/* 中央的触发按钮 */}
      <button
        onClick={toggleMenu}
        className={cn(
          'absolute top-0 left-0 w-12 h-12 rounded-full bg-primary text-primary-foreground',
          'flex items-center justify-center z-50 shadow-md',
          'transition-transform duration-300 ease-in-out',
          isMenuOpen && 'rotate-45',
        )}
      >
        {isMenuOpen ? '×' : '+'}
      </button>

      {/* 菜单项 */}
      <AnimatePresence>
        {items.map((item, index) => {
          // 根据position调整初始位置
          let originX = '50%'
          let originY = '50%'

          switch (position) {
            case 'top':
              originY = '0%'
              break
            case 'bottom':
              originY = '100%'
              break
            case 'left':
              originX = '0%'
              break
            case 'right':
              originX = '100%'
              break
            default:
              break
          }

          return (
            <motion.div
              key={item.id}
              style={{
                position: 'absolute',
                left: position === 'left' ? 10 : position === 'right' ? -10 : 0,
                top: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
                transformOrigin: `${originX} ${originY}`,
                zIndex: 50,
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: isMenuOpen ? 1 : 0,
                scale: isMenuOpen ? 1 : 0.5,
                transform: getItemPosition(index),
                pointerEvents: isMenuOpen ? 'auto' : ('none' as any),
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                duration: 0.3,
                delay: isMenuOpen ? index * 0.05 : 0,
              }}
              className={cn(
                'absolute w-10 h-10 rounded-full bg-secondary text-secondary-foreground',
                'flex items-center justify-center shadow-md cursor-pointer',
                'hover:bg-secondary/90 transition-colors',
                itemClassName,
              )}
              onClick={() => {
                item.onClick?.()
              }}
            >
              {item.icon}
              <span className="sr-only">{item.label}</span>

              {/* 悬停时显示标签 */}
              <div className="absolute opacity-0 group-hover:opacity-100 -mt-8 px-2 py-1 rounded bg-background shadow-sm text-xs whitespace-nowrap">
                {item.label}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
