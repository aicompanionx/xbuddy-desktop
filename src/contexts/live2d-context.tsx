import { createContext, useContext, useEffect, ReactNode, useRef } from 'react'
import { TwitterRaidResponse } from '@/service/preload/twitter-raid-api'
import { useLive2DAPI } from '@/pages/live2d/hooks/use-twitter-raid-api'
import { useInputManagement } from '@/pages/live2d/hooks/use-input-management'
import { hasAddress } from '@/utils/address'
import { toast } from 'sonner'
import { useChat } from '@/pages/live2d/hooks/use-chat'
import { ChatMessage } from '@/hooks/websocket/chat/use-chat-websocket'

interface Live2DContextType {
  containerRef: React.RefObject<HTMLDivElement>
  raidStatusContainerRef: React.RefObject<HTMLDivElement>
  // Input Management
  inputValue: string
  isMultiline: boolean
  inputContainerRef: React.RefObject<HTMLDivElement>
  textareaRef: React.RefObject<HTMLTextAreaElement>
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleHeightChange: (height: number) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  setInputValue: (value: string) => void

  // Target Count
  targetCount: number
  raidCount: number
  processMessage: string
  setTargetCount: (count: number) => void
  setRaidCount: (count: number) => void

  // Chat
  isChatLoading: boolean

  // Twitter Raid
  isLoginNeed: boolean
  isRaidStatusOpen: boolean
  raidResults: TwitterRaidResponse | null
  executeRaid: (count: number) => Promise<void>
  stopRaid: () => Promise<void>
  setIsRaidStatusOpen: (isOpen: boolean) => void

  // Messages
  messages: ChatMessage[]
  showMessage: boolean
  setShowMessage: (show: boolean) => void

  // Combined Operations
  onSend: () => void
  loginContinue: () => Promise<void>
}

const Live2DContext = createContext<Live2DContextType | undefined>(undefined)

interface Live2DProviderProps {
  children: ReactNode
}

export const Live2DProvider = ({ children }: Live2DProviderProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    inputValue,
    isMultiline,
    textareaRef,
    inputContainerRef,
    setInputValue,
    handleInputChange,
    handleHeightChange,
    createKeyDownHandler,
    resetInput,
  } = useInputManagement()

  const {
    raidResults,
    isRaidStatusOpen,
    setIsRaidStatusOpen,
    executeRaid: executeTwitterRaid,
    stopRaid,
    loginContinue,
    targetCount,
    raidCount,
    setTargetCount,
    setRaidCount,
    processMessage,
    raidStatusContainerRef,
    setTokenCA,
    isLoginNeed,
  } = useLive2DAPI()

  const {
    messages,
    showMessage,
    setShowMessage,
    onSend: onChatSend,
    isLoading: isChatLoading,
  } = useChat(inputValue, setInputValue)

  // Combined operations
  const onSend = () => {
    if (!inputValue.trim()) return

    onChatSend()

    // Reset input field
    resetInput()
  }

  // Execute raid operation
  const executeRaid = async (count: number) => {
    try {
      // Use token CA from input value
      const { address: tokenCA, isValid } = hasAddress(inputValue)

      if (!isValid) {
        toast.error('Invalid token CA')
        return
      }

      setRaidCount(0)
      setTargetCount(count)
      setTokenCA(tokenCA)

      await executeTwitterRaid(tokenCA)

      resetInput()
    } catch (error) {
      console.error('Error executing Twitter raid:', error)
    }
  }

  // Create key down handler for the input field
  const handleKeyDown = createKeyDownHandler(onSend)

  // Update showMessage when isRaidStatusOpen changes
  useEffect(() => {
    setShowMessage(!isRaidStatusOpen)
  }, [isRaidStatusOpen, setShowMessage])

  const value = {
    containerRef,
    raidStatusContainerRef,
    inputContainerRef,
    // Input Management
    inputValue,
    isMultiline,
    textareaRef,
    handleInputChange,
    handleHeightChange,
    handleKeyDown,
    setInputValue,
    isChatLoading,

    // Target Count
    targetCount,
    raidCount,
    setTargetCount,
    setRaidCount,

    // Comments and URLs
    processMessage,
    // Twitter Raid
    isRaidStatusOpen,
    raidResults,
    executeRaid,
    stopRaid,
    setIsRaidStatusOpen,
    isLoginNeed,
    // Messages
    messages,
    showMessage,
    setShowMessage,

    // Combined Operations
    onSend,
    loginContinue,
  }

  return <Live2DContext.Provider value={value}>{children}</Live2DContext.Provider>
}

export const useLive2D = (): Live2DContextType => {
  const context = useContext(Live2DContext)
  if (context === undefined) {
    throw new Error('useLive2D must be used within a Live2DProvider')
  }
  return context
}
