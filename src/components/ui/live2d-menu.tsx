import React from 'react'
import { cn } from '@/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { CLASSNAME } from '@/constants/classname'

interface MenuButtonProps {
  onClick?: () => void
  color: string
  icon?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, color, icon, className, style }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center shadow-md',
        color,
        className,
        CLASSNAME.IGNORE_MOUSE_EVENTS,
      )}
      onClick={onClick}
      style={style}
    >
      {icon}
    </motion.button>
  )
}

export interface Live2DMenuProps {
  isOpen: boolean
  onClose: () => void
  leftButtons?: Array<{
    color: string
    icon?: React.ReactNode
    onClick: () => void
  }>
  rightButtons?: Array<{
    color: string
    icon?: React.ReactNode
    onClick: () => void
  }>
}

const Live2DMenu: React.FC<Live2DMenuProps> = ({ isOpen, onClose, leftButtons, rightButtons }) => {
  // 阻止点击菜单时关闭菜单
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 pointer-events-none" onClick={handleMenuClick}>
          {/* 左侧按钮 */}
          <motion.div
            key="left-top"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className=" absolute left-[calc(50%-110px)] top-[calc(50%-80px)] bg-black/10 p-1 rounded-full pointer-events-auto"
          >
            <MenuButton color={leftButtons[0].color} icon={leftButtons[0].icon} onClick={leftButtons[0].onClick} />
          </motion.div>

          <motion.div
            key="left-middle"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute left-[calc(50%-140px)] top-[50%] bg-black/10 p-1 rounded-full pointer-events-auto"
          >
            <MenuButton color={leftButtons[1].color} icon={leftButtons[1].icon} onClick={leftButtons[1].onClick} />
          </motion.div>

          <motion.div
            key="left-bottom"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute left-[calc(50%-110px)] top-[calc(50%+80px)] bg-black/10 p-1 rounded-full pointer-events-auto"
          >
            <MenuButton color={leftButtons[2].color} icon={leftButtons[2].icon} onClick={leftButtons[2].onClick} />
          </motion.div>

          {/* 右侧按钮 */}
          <motion.div
            key="right-top"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="absolute left-[calc(50%+50px)] top-[calc(50%-80px)] backdrop-blur-sm bg-black/10 p-1 rounded-full pointer-events-auto"
          >
            <MenuButton color={rightButtons[0].color} icon={rightButtons[0].icon} onClick={rightButtons[0].onClick} />
          </motion.div>

          <motion.div
            key="right-middle"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute left-[calc(50%+80px)] top-[50%] backdrop-blur-sm bg-black/10 p-1 rounded-full pointer-events-auto"
          >
            <MenuButton color={rightButtons[1].color} icon={rightButtons[1].icon} onClick={rightButtons[1].onClick} />
          </motion.div>

          <motion.div
            key="right-bottom"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute left-[calc(50%+60px)] top-[calc(50%+80px)] backdrop-blur-sm bg-black/10 p-1 rounded-full pointer-events-auto"
          >
            <MenuButton color={rightButtons[2].color} icon={rightButtons[2].icon} onClick={rightButtons[2].onClick} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Live2DMenu
