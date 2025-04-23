import { CLASSNAME } from '@/constants/classname'
import { cn } from '@/utils'
import { motion } from 'framer-motion'

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

export default MenuButton
