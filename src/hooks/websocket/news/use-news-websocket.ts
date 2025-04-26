import { useState, useEffect, useCallback } from 'react'
import useWebSocket from '..'
import { WebSocketMessage } from '../../../types/websocket'
import { News } from './type'

// News message type
interface NewsWebSocketMessage extends WebSocketMessage<News | { message: string }> {
  type: 'news_update' | 'error' | string
  payload?: News | { message: string }
}

// Return type
interface UseNewsWebSocketResult {
  latestNews: News | null
  loading: boolean
  error: string | null
  isConnected: boolean
  reconnect: () => void
  sendQuery: (query: { keyword?: string; category?: string; limit?: number }) => void
}

// News WebSocket API URL
const NEWS_WEBSOCKET_URL = 'wss://api.xbuddy.me/dev/api/v1/news/ws'

/**
 * Hook for using news WebSocket
 */
const useNewsWebSocket = (): UseNewsWebSocketResult => {
  const [latestNews, setLatestNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Connect to news WebSocket
  const { sendMessage, lastMessage, reconnect, isOpen } = useWebSocket(NEWS_WEBSOCKET_URL, {
    onOpen: () => {
      console.log('News WebSocket connection established')
      setLoading(false)
      setError(null)
      // Automatically request news on connection
      sendMessage({ type: 'get_news' })
    },
    onClose: () => {
      console.log('News WebSocket connection closed')
      setLoading(false)
    },
    onError: (event: WebSocketEventMap['error']) => {
      console.error('News WebSocket error:', event)
      setError('WebSocket connection error')
      setLoading(false)
    },
    // Heartbeat settings
    heartbeatInterval: 30000,
    heartbeatMessage: { type: 'ping' },
    // Auto reconnect settings
    reconnectAttempts: 5,
    reconnectInterval: 3000,
    shouldReconnect: true,
  })

  // Handle received messages
  useEffect(() => {
    if (lastMessage) {
      try {
        // Check if message might be a direct news object
        if (lastMessage && typeof lastMessage === 'object' && 'title' in lastMessage) {
          setLatestNews(lastMessage as unknown as News)
          return
        }

        // Handle as WebSocketMessage
        const newsMessage = lastMessage as NewsWebSocketMessage

        switch (newsMessage.type) {
          case 'news_update':
            if (newsMessage.payload && typeof newsMessage.payload === 'object' && !Array.isArray(newsMessage.payload)) {
              setLatestNews(newsMessage.payload as News)
            }
            break
          case 'error': {
            const errorPayload = newsMessage.payload as { message: string }
            if (errorPayload && errorPayload.message) {
              setError(errorPayload.message)
            } else {
              setError('Unknown error occurred')
            }
            break
          }
          case 'pong':
            break
          default:
            console.log('Received unknown message type:', newsMessage.type)
        }
      } catch (err) {
        console.error('Error processing news message:', err)
        setError('Error processing news message')
      }
    }
  }, [lastMessage])

  // Send query request
  const sendQuery = useCallback(
    (query: { keyword?: string; category?: string; limit?: number }) => {
      sendMessage({
        type: 'query_news',
        payload: query,
      })
      setLoading(true)
    },
    [sendMessage],
  )

  return {
    latestNews,
    loading,
    error,
    isConnected: isOpen,
    reconnect,
    sendQuery,
  }
}

export default useNewsWebSocket
