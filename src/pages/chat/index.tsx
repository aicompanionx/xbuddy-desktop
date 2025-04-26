import { useState, useRef, useEffect } from 'react'
import { IoSend } from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'
import TextareaAutosize from 'react-textarea-autosize'
export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; id: string }>>([
    { text: 'Hello, I can help you with anything.', isUser: false, id: 'initial-message' },
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSendMessage = () => {
    if (inputText.trim() === '') return

    const userMessageId = `user-${Date.now()}`
    setMessages((prev) => [...prev, { text: inputText, isUser: true, id: userMessageId }])

    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          text: `I received your message: "${inputText}"`,
          isUser: false,
          id: `bot-${Date.now()}`,
        },
      ])
    }, 1500)

    setInputText('')

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const adjustTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    setInputText(textarea.value)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }, [])
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={cn('flex', message.isUser ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'p-4 rounded-2xl shadow-sm max-w-[80%]',
                  message.isUser
                    ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white'
                    : 'bg-white dark:bg-gray-800 dark:text-gray-200',
                )}
              >
                <p className="leading-relaxed">{message.text}</p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              <div className="p-4 rounded-2xl shadow-sm bg-white dark:bg-gray-800 dark:text-gray-200 max-w-[80%]">
                <div className="flex space-x-2">
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="p-4 bg-white dark:bg-gray-800 shadow-lg"
      >
        <div className="flex items-end bg-gray-50 dark:bg-gray-700 rounded-2xl p-2 shadow-inner">
          <TextareaAutosize
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 p-3 bg-transparent border-none focus:outline-none focus:ring-0 dark:text-white resize-none min-h-[40px] max-h-[150px] scrollbar-thin"
            minRows={1}
            maxRows={5}
            cacheMeasurements
            style={{
              overflow: inputText ? 'auto' : 'hidden',
            }}
          />
          <motion.button
            onClick={handleSendMessage}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-blue-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white p-3 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center"
          >
            <IoSend size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
