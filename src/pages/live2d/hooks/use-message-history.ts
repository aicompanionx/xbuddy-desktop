import { useState } from 'react'

/**
 * Message interface for chat history
 */
export interface Message {
    id: string
    message: string
    isUser: boolean
}

/**
 * Hook for managing message history
 * 
 * This hook handles chat messages storage and display settings
 */
export function useMessageHistory() {
    // Message state
    const [messages, setMessages] = useState<Message[]>([])
    const [showMessage, setShowMessage] = useState(true)

    /**
     * Add a user message to the chat history
     */
    const addUserMessage = (content: string) => {
        if (!content.trim()) return

        const message: Message = {
            id: Date.now().toString(),
            message: content.trim(),
            isUser: true
        }

        setMessages(prev => [...prev, message])
        return message
    }

    /**
     * Add a system message to the chat history
     */
    const addSystemMessage = (content: string) => {
        if (!content.trim()) return

        const message: Message = {
            id: Date.now().toString(),
            message: content.trim(),
            isUser: false
        }

        setMessages(prev => [...prev, message])
        return message
    }

    /**
     * Get the latest message
     */
    const getLatestMessage = (): Message | undefined => {
        if (messages.length === 0) return undefined
        return messages[messages.length - 1]
    }

    /**
     * Clear all messages
     */
    const clearMessages = () => {
        setMessages([])
    }

    return {
        // State
        messages,
        showMessage,

        // Setters
        setShowMessage,

        // Methods
        addUserMessage,
        addSystemMessage,
        getLatestMessage,
        clearMessages
    }
} 