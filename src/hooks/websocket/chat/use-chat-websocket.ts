import { useState, useEffect, useCallback, useRef } from 'react'
import useWebSocket from '..'
import { WebSocketMessage } from '@/types/websocket'
import { storageUtil } from '@/utils/storage'

// Chat message type
export interface ChatMessage {
    lang: string
    message?: string
    content?: string
}

// Chat WebSocket message type
interface ChatWebSocketMessage extends WebSocketMessage<ChatMessage> {
    type: 'chat' | 'error' | 'EOF' | string
    data?: ChatMessage
}

// Chat WebSocket API URL
// const CHAT_WEBSOCKET_URL = 'wss://api.xbuddy.me/api/v1/token-analysis/ws'
const CHAT_WEBSOCKET_URL = 'ws://192.168.2.16:8000/api/v1/token-analysis/ws'

/**
 * Hook for chat WebSocket
 */
export const useChatWebSocket = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isEOF, setIsEOF] = useState(false)
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const lastProcessedMessageRef = useRef<string>('')

    const { getLanguageCode } = storageUtil()

    // Connect to chat WebSocket
    const { sendMessage: sendWebSocketMessage, lastMessage, reconnect, isOpen } = useWebSocket<ChatMessage>(CHAT_WEBSOCKET_URL, {
        onOpen: () => {
            console.log('Chat WebSocket connection established')
            setIsLoading(false)
            setIsConnected(true)
            setError(null)
            // Automatically request history messages on connection
            sendWebSocketMessage({ type: 'ping' })
        },
        onClose: () => {
            console.log('Chat WebSocket connection closed')
            setIsLoading(false)
            setIsConnected(false)
        },
        onError: (event: WebSocketEventMap['error']) => {
            console.error('Chat WebSocket error:', event)
            setError('WebSocket connection error')
            setIsLoading(false)
            setIsConnected(false)
        },
        heartbeatInterval: 30000,
        heartbeatMessage: { type: 'ping' },
        reconnectAttempts: 5,
        reconnectInterval: 3000,
        shouldReconnect: true,
    })

    // Handle received messages
    useEffect(() => {
        if (!lastMessage) return;

        try {
            const chatMessage = lastMessage as ChatWebSocketMessage;

            // Skip processed same messages to avoid duplicate processing
            const messageId = JSON.stringify(chatMessage);
            if (messageId === lastProcessedMessageRef.current) {
                return;
            }

            lastProcessedMessageRef.current = messageId;

            switch (chatMessage.type) {
                case 'chat':
                    if (!isEOF) {
                        setIsEOF(true);
                        setMessages(prev => [...prev, chatMessage.data]);
                    } else if (chatMessage.data && chatMessage.data.message) {
                        setMessages(prev => {
                            if (prev.length === 0) return [chatMessage.data];

                            return [
                                ...prev.slice(0, -1),
                                {
                                    ...prev[prev.length - 1],
                                    message: (prev[prev.length - 1].message || '') + (chatMessage.data.message || '')
                                }
                            ];
                        });
                    }
                    break;

                case 'EOF':
                    setIsEOF(false);
                    setIsLoading(false);
                    break;

                case 'error': {
                    const errorPayload = chatMessage.data;
                    if (errorPayload && errorPayload.message) {
                        setError(errorPayload.message);
                    } else {
                        setError('Unknown error occurred');
                    }
                    break;
                }

                case 'pong':
                    break;

                default:
                    console.log('Received unknown message type:', chatMessage.type);
            }
        } catch (err) {
            console.error('Error processing chat message:', err);
            setError('Error processing chat message');
        }
    }, [lastMessage, isEOF]);

    // Send text message
    const sendMessage = useCallback((text: string) => {
        if (text.trim()) {
            sendWebSocketMessage({
                type: 'chat',
                data: {
                    content: text,
                    lang: getLanguageCode(),
                },
            })
            setIsLoading(true)
        }
    }, [sendWebSocketMessage, getLanguageCode])

    return {
        messages,
        isConnected: isOpen,
        isLoading,
        error,
        sendMessage,
        reconnect
    }
}
