import React, { RefObject, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MenuButton from './live2d-menu-button'
import FloatingPopup from '@/components/ui/floating-popup'
import { cn } from '@/utils'

export interface Live2DMenuProps {
  isOpen: boolean
  referenceElement: RefObject<HTMLElement>
  leftButtons?: Array<{
    color: string
    icon?: React.ReactNode
    onClick: () => void
    ref?: React.RefObject<HTMLDivElement>
  }>
  rightButtons?: Array<{
    color: string
    icon?: React.ReactNode
    onClick: () => void
  }>
  onSettingsButtonMount?: (ref: HTMLDivElement | null) => void
}

const Live2DMenu: React.FC<Live2DMenuProps> = ({
  isOpen,
  referenceElement,
  leftButtons,
  rightButtons,
  onSettingsButtonMount,
}) => {
  const { height } = referenceElement.current?.getBoundingClientRect() || {}
  const settingsButtonRef = useRef<HTMLDivElement>(null)

  // Prevent click menu from closing
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  useEffect(() => {
    if (onSettingsButtonMount && settingsButtonRef.current) {
      onSettingsButtonMount(settingsButtonRef.current)
    }
  }, [onSettingsButtonMount, isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 pointer-events-none bg-transparent text-white" onClick={handleMenuClick}>
          {/* Left buttons */}
          <FloatingPopup
            isNeedArrow={false}
            isActive={isOpen}
            className="bg-transparent shadow-none border-none"
            referenceElement={referenceElement}
            placement="left"
            width="w-max max-w-xs"
          >
            <motion.div
              key="left-top"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              className={cn('absolute pointer-events-auto')}
              style={{
                top: height ? `${-height * 0.3}px` : 0,
              }}
            >
              <MenuButton color={leftButtons[0].color} icon={leftButtons[0].icon} onClick={leftButtons[0].onClick} />
            </motion.div>
          </FloatingPopup>

          <FloatingPopup
            isNeedArrow={false}
            isActive={isOpen}
            className="bg-transparent shadow-none border-none"
            referenceElement={referenceElement}
            placement="left"
            width="w-max max-w-xs"
          >
            <motion.div
              key="left-middle"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute left-[calc(-100%)] top-0 pointer-events-auto"
              style={{
                top: height ? `${-height * 0.05}px` : 0,
              }}
            >
              <MenuButton color={leftButtons[1].color} icon={leftButtons[1].icon} onClick={leftButtons[1].onClick} />
            </motion.div>
          </FloatingPopup>

          <FloatingPopup
            isNeedArrow={false}
            isActive={isOpen}
            className="bg-transparent shadow-none border-none"
            referenceElement={referenceElement}
            placement="left"
            width="w-max max-w-xs"
          >
            <motion.div
              key="left-bottom"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="absolute pointer-events-auto"
              style={{
                top: height ? `${height * 0.2}px` : 0,
              }}
              ref={settingsButtonRef}
            >
              <MenuButton color={leftButtons[2].color} icon={leftButtons[2].icon} onClick={leftButtons[2].onClick} />
            </motion.div>
          </FloatingPopup>

          {/* Right buttons */}
          <FloatingPopup
            isNeedArrow={false}
            isActive={isOpen}
            className="bg-transparent shadow-none border-none"
            referenceElement={referenceElement}
            placement="right"
            width="w-max max-w-xs"
          >
            <motion.div
              key="right-top"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3 }}
              className="absolute left-[calc(-100%)] backdrop-blur-sm pointer-events-auto"
              style={{
                top: height ? `${-height * 0.3}px` : 0,
              }}
            >
              <MenuButton color={rightButtons[0].color} icon={rightButtons[0].icon} onClick={rightButtons[0].onClick} />
            </motion.div>
          </FloatingPopup>

          <FloatingPopup
            isNeedArrow={false}
            isActive={isOpen}
            className="bg-transparent shadow-none border-none"
            referenceElement={referenceElement}
            placement="right"
            width="w-max max-w-xs"
          >
            <motion.div
              key="right-middle"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute left-[calc(40%+30px)] backdrop-blur-sm pointer-events-auto"
              style={{
                top: height ? `${-height * 0.05}px` : 0,
              }}
            >
              <MenuButton color={rightButtons[1].color} icon={rightButtons[1].icon} onClick={rightButtons[1].onClick} />
            </motion.div>
          </FloatingPopup>

          <FloatingPopup
            isNeedArrow={false}
            isActive={isOpen}
            className="bg-transparent shadow-none border-none"
            referenceElement={referenceElement}
            placement="right"
            width="w-max max-w-xs"
          >
            <motion.div
              key="right-bottom"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="absolute left-[calc(-80%)] backdrop-blur-sm pointer-events-auto"
              style={{
                top: height ? `${height * 0.2}px` : 0,
              }}
            >
              <MenuButton color={rightButtons[2].color} icon={rightButtons[2].icon} onClick={rightButtons[2].onClick} />
            </motion.div>
          </FloatingPopup>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Live2DMenu
