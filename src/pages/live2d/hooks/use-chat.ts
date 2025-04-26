import { useChatWebSocket } from "@/hooks/websocket/chat/use-chat-websocket"
import { KeyboardEvent, useState } from "react"

export const useChat = (inputValue: string, setInputValue?: (value: string) => void) => {
    const [showMessage, setShowMessage] = useState(true)
    const { messages, isLoading, sendMessage } = useChatWebSocket()

    const onSend = () => {
        if (!inputValue.trim()) {
            console.error('Please enter a message')
            return
        }

        setShowMessage(true)

        sendMessage(inputValue)

        setInputValue?.('')
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
        }
    }

    return {
        messages,
        isLoading,
        onSend,
        handleKeyDown,
        showMessage,
        setShowMessage
    }
}