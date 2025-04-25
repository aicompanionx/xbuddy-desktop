import { useRef, useState, useEffect } from 'react'
import FloatingPopup from '../ui/floating-popup'
import { Button } from '../ui/button'
import { IoMic, IoSend, IoAdd, IoTrash } from 'react-icons/io5'
import { cn } from '@/utils'
import { motion, AnimatePresence } from 'framer-motion'
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from 'sonner'
import { Live2DRaidStatus } from './live2d-raid-status'

interface Live2DInputProps {
  containerRef: React.RefObject<HTMLDivElement>
  isVisible: boolean
  onClose: () => void
  targetUrl?: string // Optional target URL property
}

const counts = [1, 5, 10]

export const Live2DInput = ({
  containerRef,
  isVisible,
  onClose,
  targetUrl = 'https://x.com/elonmusk',
}: Live2DInputProps) => {
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [isMultiline, setIsMultiline] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isRaidStatusOpen, setIsRaidStatusOpen] = useState(false)
  const [targetCount, setTargeCount] = useState(10)
  const [raidCount, setRaidCount] = useState(5)

  // State for multiple target URLs
  const [targetUrls, setTargetUrls] = useState<string[]>([targetUrl])
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [newUrlInput, setNewUrlInput] = useState('')

  // State for multiple comments
  const [commentList, setCommentList] = useState<string[]>([])
  const [useMultipleComments, setUseMultipleComments] = useState(false)

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    setInputValue(value)

    // Determine if multiline based on content
    setIsMultiline(event.target.value.includes('\n') || event.target.scrollHeight > 50)

    // Update comment list if multiple comments mode is enabled
    if (useMultipleComments) {
      setCommentList(value.split('\n').filter((comment) => comment.trim() !== ''))
    }
  }

  const addTargetUrl = () => {
    if (newUrlInput.trim() && !targetUrls.includes(newUrlInput.trim())) {
      setTargetUrls([...targetUrls, newUrlInput.trim()])
      setNewUrlInput('')
    }
  }

  const removeTargetUrl = (urlToRemove: string) => {
    if (targetUrls.length > 1) {
      setTargetUrls(targetUrls.filter((url) => url !== urlToRemove))
    } else {
      toast.error('At least one target URL is required')
    }
  }

  const toggleCommentMode = () => {
    setUseMultipleComments(!useMultipleComments)
    if (!useMultipleComments && inputValue.trim()) {
      // When enabling multiple comments, split existing input by new lines
      setCommentList([inputValue.trim()])
    }
  }

  const onClickRaid = (count: number) => {
    setIsPopupOpen(false)
    setIsRaidStatusOpen(true)

    // Check if there's content to send
    if (!inputValue.trim()) {
      toast.error('Please enter a comment')
      return
    }

    // Prepare the payload based on whether using multiple URLs/comments
    const payload: {
      url?: string
      urls?: string
      comment?: string
      comments?: string
      repeat: number
    } = {
      repeat: count,
    }

    // Handle URLs
    if (targetUrls.length > 1) {
      payload.urls = targetUrls.join(',')
    } else {
      payload.url = targetUrls[0]
    }

    // Handle comments
    if (useMultipleComments && commentList.length > 0) {
      payload.comments = commentList.join(',')
    } else {
      payload.comment = inputValue.trim()
    }

    // Send message to main process with parameters
    // TODO: Implement this

    // Show feedback
    toast.success(`Started ${count} Raid(s) to ${targetUrls.length} URL(s)`)

    // Reset input and close input box
    setInputValue('')
    onClose()
  }

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log('Sending message:', inputValue)
      setInputValue('')
      setIsMultiline(false)

      // Close the input after sending
      onClose()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isVisible &&
        inputContainerRef.current &&
        !inputContainerRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsPopupOpen(false)
        setShowUrlInput(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, setIsPopupOpen, containerRef])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, onClose])

  // Focus textarea when visible
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [isVisible])

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
                    placeholder={
                      useMultipleComments ? 'Enter multiple comments (one per line)...' : 'Type your comment...'
                    }
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
                    onHeightChange={(height) => {
                      // 40px is single line height
                      setIsMultiline(height > 40)
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                      if (e.key === 'Enter' && !e.shiftKey && !useMultipleComments) {
                        e.preventDefault()
                        handleSend()
                      } else if (e.key === 'Enter' && e.shiftKey) {
                        // Force multiline mode when user explicitly adds a new line
                        setIsMultiline(true)
                      }
                    }}
                  />
                </div>

                <div className={cn('flex items-center', isMultiline ? 'self-end' : 'ml-2')}>
                  <div className="relative">
                    {!false && (
                      <Button
                        ref={triggerRef}
                        className="text-nowrap !bg-transparent text-white hover:text-white/50 rounded-full !shadow-none !outline-none whitespace-nowrap h-8"
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
                        className="flex flex-col gap-2 bg-sky-500/80 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-lg"
                      >
                        {counts.map((count, index) => (
                          <motion.div
                            key={count}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              transition: { delay: index * 0.1 },
                            }}
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }}
                            onClick={() => onClickRaid(count)}
                            className="text-white font-medium cursor-pointer rounded-lg p-2.5 flex items-center justify-between transition-colors group"
                          >
                            <span className="transition-colors">{count} Raid</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    </FloatingPopup>
                  </div>

                  <Button
                    size="icon"
                    className="w-8 h-8 !bg-transparent text-white hover:text-white/50 rounded-full !shadow-none !outline-none"
                    aria-label="Voice input"
                  >
                    <IoMic size={20} />
                  </Button>
                  <Button
                    size="icon"
                    className="w-8 h-8 !bg-transparent text-white hover:text-white/50 rounded-full !shadow-none !outline-none"
                    onClick={handleSend}
                    aria-label="Send message"
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
