import { useState, useRef, useEffect } from 'react'
import { IoSend } from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils'
import TextareaAutosize from 'react-textarea-autosize'
export default function ChatPage() {
  // 定义聊天消息状态数组，每条消息包含文本内容、是否为用户消息和唯一ID
  // 初始化一些示例对话，展示白猫桌面宠物与用户的互动场景
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; id: string }>>([
    {
      // 白猫的初始问候语
      text: "Hello master! I'm your desktop pet White Cat. How can I help you today?",
      isUser: false,
      id: 'initial-message',
    },
    // 用户谈论天气的消息
    { text: 'Hi, White Cat! The weather is really nice today.', isUser: true, id: 'user-1' },
    {
      // 白猫回应天气话题，并提到可以改变发型
      text: "Yes indeed, master! It's sunny and perfect for a walk outside. Would you like me to join you? I can change to my ball hairstyle to look even cuter!",
      isUser: false,
      id: 'bot-1',
    },
    // // 用户请求讲笑话
    // { text: 'Can you tell me a joke?', isUser: true, id: 'user-2' },
    // {
    //   // 白猫讲了一个关于猫的笑话
    //   text: 'Of course! A cat walks into a coffee shop and orders a coffee. The waiter asks: "Would you like some cream with that?" The cat replies: "No thanks, I can make my own cream! Meow~"',
    //   isUser: false,
    //   id: 'bot-2',
    // },
    // // 用户请求设置会议提醒
    // { text: "That's funny! By the way, can you remind me about my meeting at 3pm?", isUser: true, id: 'user-3' },
    // {
    //   // 白猫确认已设置提醒
    //   text: "I've set a reminder for your 3pm meeting, master! I'll make sure to notify you 15 minutes before. Is there anything else you need help with today?",
    //   isUser: false,
    //   id: 'bot-3',
    // },
    // // 用户表达疲劳感
    // { text: "I'm feeling a bit tired. Any suggestions?", isUser: true, id: 'user-4' },
    // {
    //   // 白猫提供休息建议和可爱的互动
    //   text: 'Oh no! Maybe you should take a short break? Research shows that a 15-minute power nap can boost your energy! Or perhaps some stretching exercises? I can demonstrate some cute cat stretches! *stretches paws adorably*',
    //   isUser: false,
    //   id: 'bot-4',
    // },
    // // 用户询问白猫的喜好
    // { text: "What's your favorite food, White Cat?", isUser: true, id: 'user-5' },
    // {
    //   // 白猫分享自己喜欢的食物并提议跳舞
    //   text: 'Meow~ I love magical fish treats! They make my whiskers tingle with joy! But I also enjoy virtual milk tea on special occasions. Would you like to see me do a happy dance?',
    //   isUser: false,
    //   id: 'bot-5',
    // },
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
            placeholder="Type a message..."
            className="flex-1 p-3 bg-transparent border-none focus:outline-none focus:ring-0 dark:text-white resize-none h-[40px] max-h-[150px] scrollbar-thin"
            rows={1}
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
