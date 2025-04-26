import { useEffect } from 'react'
import FloatingPopup from '@/components/ui/floating-popup'
import { cn } from '@/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Live2DRaidStatus } from './live2d-raid-status'
import { useTranslation } from 'react-i18next'
import { Live2DInputAndIcons } from './live2d-input-and-icons'
import { useLive2D } from '@/contexts/live2d-context'
import { useLive2DMenu } from '@/contexts/live2d-menu-context'
import { IoHeart } from 'react-icons/io5'
import ReactMarkdown from 'react-markdown'
export const Live2DChat = () => {
  const { t } = useTranslation()

  const { containerRef } = useLive2D()
  const { setIsMenuOpen, isMenuOpen } = useLive2DMenu()

  // Use Live2D context instead of local state
  const { isRaidStatusOpen, messages, showMessage, isMultiline, isChatLoading, inputContainerRef, setShowMessage } =
    useLive2D()

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen, setIsMenuOpen])

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
        className={cn(
          'border-none bg-transparent max-w-md rounded-xl p-2 transition-allbg-transparent shadow-none h-[auto]',
          isMenuOpen && !isRaidStatusOpen ? '' : 'hidden',
        )}
      >
        {/* <AnimatePresence> */}
        <div ref={inputContainerRef} className="h-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'bg-sky-400 px-4 py-2 w-[330px] rounded-xl h-auto',
              isMenuOpen && !isRaidStatusOpen ? '' : 'hidden',
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

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 bg-black/70 rounded-xl w-[75px] mx-auto px-2"
            style={{
              display: isMenuOpen && !isRaidStatusOpen ? '' : 'none',
            }}
          >
            <div className="flex justify-evenly items-center">
              <IoHeart className="text-red-500" size={20} />
              <span className="text-white">LV.1</span>
            </div>
          </motion.div>
        </div>
        {/* </AnimatePresence> */}
      </FloatingPopup>

      <FloatingPopup
        isActive={isRaidStatusOpen}
        className="bg-transparent border-none shadow-none"
        referenceElement={containerRef}
        placement="top"
      >
        <Live2DRaidStatus />
      </FloatingPopup>

      {/* <FloatingPopup
        isActive={!!messages[messages.length - 1]?.message && showMessage}
        className="w-[330px] text-wrap bg-white shadow border-none rounded-xl p-2 mb-2"
        referenceElement={inputContainerRef}
        placement="top"
      >
        <div className="flex items-center justify-between">
          <span className="text-wrap prose prose-sm max-w-none">
            {messages[messages.length - 1]?.message && (
              <ReactMarkdown>{messages[messages.length - 1]?.message}</ReactMarkdown>
            )}
          </span>
        </div>
      </FloatingPopup> */}
    </>
  )
}
