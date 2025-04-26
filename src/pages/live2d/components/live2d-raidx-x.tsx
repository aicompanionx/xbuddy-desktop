import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import FloatingPopup from '@/components/ui/floating-popup'
import { useEffect, useRef, useState } from 'react'
import { useLive2D } from '@/contexts/live2d-context'

const counts = [1, 5, 10]

export const Live2DRaidX = () => {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  // Use TwitterRaid context
  const { isRaidStatusOpen, executeRaid } = useLive2D()

  const onClickRaid = async (count: number) => {
    // Close popup
    setIsPopupOpen(false)

    // Execute raid
    await executeRaid(count)
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsPopupOpen(false)
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div ref={triggerRef} className="relative">
      {!isRaidStatusOpen && (
        <Button
          className="text-nowrap !bg-transparent text-white hover:text-white/50 rounded-full !shadow-none !outline-none whitespace-nowrap h-8 px-1"
          onClick={() => setIsPopupOpen(true)}
        >
          Raid X
        </Button>
      )}
      <FloatingPopup
        isActive={isPopupOpen}
        referenceElement={triggerRef}
        placement="top"
        isNeedArrow={false}
        className="bg-transparent border-none shadow-none p-0"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex w-[120px] flex-col gap-2 bg-sky-500/80 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-lg"
        >
          {counts.map((count) => (
            <motion.div
              key={count}
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { delay: 0 },
              }}
              whileHover={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
              onClick={() => onClickRaid(count)}
              className="text-white font-medium cursor-pointer rounded-lg py-1 px-2.5 flex items-center justify-between transition-colors group"
            >
              <span className="transition-colors">{count} Raid</span>
            </motion.div>
          ))}
        </motion.div>
      </FloatingPopup>
    </div>
  )
}
