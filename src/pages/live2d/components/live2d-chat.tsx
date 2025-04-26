import { useEffect, useRef } from 'react'
import FloatingPopup from '@/components/ui/floating-popup'
import { cn } from '@/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Live2DRaidStatus } from './live2d-raid-status'
import { useTranslation } from 'react-i18next'
import { Live2DInputAndIcons } from './live2d-input-and-icons'
import { useLive2D } from '@/contexts/live2d-context'
import { useLive2DMenu } from '@/contexts/live2d-menu-context'

interface Live2DInputProps {
  containerRef: React.RefObject<HTMLDivElement>
  isVisible: boolean
  targetUrl?: string // Optional target URL property
}

export const Live2DChat = ({ containerRef, isVisible }: Live2DInputProps) => {
  const { t } = useTranslation()

  const { setIsMenuOpen } = useLive2DMenu()

  // Use Live2D context instead of local state
  const { isRaidStatusOpen, messages, showMessage, isMultiline, isChatLoading, inputContainerRef, setShowMessage } =
    useLive2D()

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, setIsMenuOpen])

  // Hide messages when Raid status is open
  useEffect(() => {
    setShowMessage(!isRaidStatusOpen)
  }, [isRaidStatusOpen, setShowMessage])

  return (
    <>
      <FloatingPopup
        referenceElement={containerRef}
        isActive={true}
        placement="top"
        isNeedArrow={false}
        className="bg-transparent border-none shadow-none"
      >
        <AnimatePresence>
          {isVisible && !isRaidStatusOpen && (
            <motion.div
              ref={inputContainerRef}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'w-[330px] max-w-md bg-sky-400 rounded-xl p-2 shadow-lg transition-all',
                isChatLoading ? 'w-[250px]' : '',
              )}
            >
              {/* Comment input section */}
              <div className={cn(isMultiline ? 'flex flex-col space-y-2' : 'flex items-center')}>
                <div
                  className="text-white px-4 py-2 flex items-center justify-center"
                  style={{
                    display: isChatLoading ? '' : 'none',
                  }}
                >
                  <span className="inline-flex items-center gap-2">{t('chat.loading')}</span>
                </div>

                <Live2DInputAndIcons
                  style={{
                    display: isChatLoading ? 'none' : '',
                  }}
                  onClose={() => setIsMenuOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPopup>

      <FloatingPopup
        isActive={isRaidStatusOpen}
        className="bg-transparent border-none shadow-none"
        referenceElement={containerRef}
        placement="top"
        offsetDistance={0}
      >
        <Live2DRaidStatus />
      </FloatingPopup>

      <FloatingPopup
        isActive={!!messages[messages.length - 1]?.message && showMessage}
        isNeedArrow={false}
        className="bg-transparent border-none shadow-none z-[-1]"
        referenceElement={isVisible ? inputContainerRef : containerRef}
        placement="top"
      >
        {/* Chat history */}
        <div className="w-[330px] text-wrap bg-white shadow rounded-xl p-2">
          <div className="flex items-center justify-between">
            <span className=" text-wrap">{messages[messages.length - 1]?.message}</span>
          </div>
        </div>
      </FloatingPopup>
    </>
  )
}
