import { useRef, useState } from 'react'
import FloatingPopup from '@/components/ui/floating-popup'
import { Button } from '@/components/ui/button'
import { IoMic, IoSend } from 'react-icons/io5'
import { cn } from '@/utils'
import { motion, AnimatePresence } from 'framer-motion'
import TextareaAutosize from 'react-textarea-autosize'
import { Live2DRaidStatus } from './live2d-raid-status'
import { Live2DRaidX } from './live2d-raidx-x'
import { useLive2DInput } from '@/pages/live2d/hooks/use-live2d-input'

interface Live2DInputProps {
  containerRef: React.RefObject<HTMLDivElement>
  isVisible: boolean
  onClose: () => void
  targetUrl?: string // Optional target URL property
}

export const Live2DInput = ({
  containerRef,
  isVisible,
  onClose,
  targetUrl = 'https://x.com/elonmusk',
}: Live2DInputProps) => {
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const [isRaidStatusOpen, setIsRaidStatusOpen] = useState(false)
  const [targetCount, setTargeCount] = useState(10)
  const [raidCount, setRaidCount] = useState(5)

  const {
    chatList,
    textareaRef,
    inputValue,
    setInputValue,
    isMultiline,
    commentList,
    useMultipleComments,
    setUseMultipleComments,
    handleInputChange,
    handleSend,
    handleKeyDown,
    handleHeightChange,
  } = useLive2DInput({ isVisible, onClose })

  // State for multiple target URLs
  const [targetUrls, setTargetUrls] = useState<string[]>([targetUrl])

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
          {chatList.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {item}
            </motion.div>
          ))}
          {isVisible && (
            <motion.div
              ref={inputContainerRef}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-[330px] max-w-md bg-sky-400 rounded-xl p-2 shadow-lg"
            >
              {/* Comment input section */}
              <div className={cn(isMultiline ? 'flex flex-col space-y-2' : 'flex items-center')}>
                <div className="w-full relative">
                  <TextareaAutosize
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={useMultipleComments ? '输入多条评论（每行一条）...' : '输入你的评论...'}
                    minRows={useMultipleComments ? 3 : 1}
                    maxRows={6}
                    cacheMeasurements
                    className={cn(
                      'resize-none border-none outline-0 shadow-none px-3 py-2 rounded w-full text-sm',
                      isMultiline || useMultipleComments ? '' : 'max-h-8 overflow-hidden',
                    )}
                    style={{
                      whiteSpace: isMultiline || useMultipleComments ? 'normal' : 'nowrap',
                      overflowX: 'hidden',
                    }}
                    onHeightChange={handleHeightChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <div className={cn('flex items-center', isMultiline ? 'self-end' : 'ml-2')}>
                  <Live2DRaidX
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onClose={onClose}
                    targetUrls={targetUrls}
                    commentList={commentList}
                    isRaidStatusOpen={isRaidStatusOpen}
                    setIsRaidStatusOpen={setIsRaidStatusOpen}
                    useMultipleComments={useMultipleComments}
                  />

                  <Button
                    size="icon"
                    className="w-8 h-8 !bg-transparent text-white hover:text-white/50 rounded-full !shadow-none !outline-none"
                    aria-label="语音输入"
                  >
                    <IoMic size={20} />
                  </Button>
                  <Button
                    size="icon"
                    className="w-8 h-8 !bg-transparent text-white hover:text-white/50 rounded-full !shadow-none !outline-none"
                    onClick={handleSend}
                    aria-label="发送消息"
                  >
                    <IoSend size={18} className="-translate-y-0.5 rotate-[-45deg]" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingPopup>

      <FloatingPopup
        isActive={isRaidStatusOpen}
        isNeedArrow={false}
        className="bg-transparent border-none shadow-none"
        referenceElement={isVisible ? inputContainerRef : containerRef}
        placement="top"
        offsetDistance={0}
      >
        <Live2DRaidStatus
          targetCount={targetCount}
          raidCount={raidCount}
          onStopRaid={() => setIsRaidStatusOpen(false)}
        />
      </FloatingPopup>
    </>
  )
}
