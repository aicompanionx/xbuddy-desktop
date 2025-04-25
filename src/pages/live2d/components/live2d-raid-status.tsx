import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { IoStop } from 'react-icons/io5'
import { cn } from '@/utils'

interface Live2DRaidStatusProps {
  onStopRaid?: () => void
  isActive?: boolean
  raidCount?: number
  targetCount?: number
}

export const Live2DRaidStatus = ({
  onStopRaid,
  isActive = true,
  raidCount = 0,
  targetCount = 5,
}: Live2DRaidStatusProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle mouse movement to detect if cursor is over the button area
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return

      const buttonRect = buttonRef.current.getBoundingClientRect()
      const isOverButton =
        e.clientX >= buttonRect.left &&
        e.clientX <= buttonRect.right &&
        e.clientY >= buttonRect.top &&
        e.clientY <= buttonRect.bottom

      setIsButtonHovered(isOverButton)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // Don't render if not active
  if (!isActive) return null

  // Button should be visible when container is hovered or button is hovered
  const shouldShowButton = isHovered || isButtonHovered

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative flex items-center justify-center px-4 py-2  bg-white rounded-xl shadow w-[330px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col">
        <p className="text-sky-500 font-medium">Raiding for you (looking happy)</p>
        <p className="text-sm text-gray-500">
          Progress: {raidCount}/{targetCount}
        </p>
      </div>

      <div className="h-12 w-12 relative ml-4">
        {/* Make sure you have the corresponding GIF file in the images folder */}
        <img src="assets/images/work-in-progress.gif" alt="Raid Animation" className="h-full w-full object-contain" />
      </div>

      {/* Stop button, visible on hover */}
      <motion.div
        ref={buttonRef}
        className={cn(
          'absolute -top-1/2 translate-y-[-10px] left-0 flex justify-center z-10',
          shouldShowButton ? 'opacity-100' : 'opacity-0',
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: shouldShowButton ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          size="sm"
          variant="destructive"
          className="!bg-white pl-[16px] text-red-500 shadow"
          onClick={onStopRaid}
        >
          Stop Raid
        </Button>
      </motion.div>
    </motion.div>
  )
}
