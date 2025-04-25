import { useState, useEffect, useRef, useCallback } from 'react'
import useWebSocketOriginal, { ReadyState } from 'react-use-websocket'
import { WebSocketMessage, WebSocketOptions, WebSocketHookResult, WebSocketLike } from '../../types/websocket'

const useWebSocket = (url: string, options: WebSocketOptions = {}): WebSocketHookResult => {
  const {
    onOpen,
    onClose,
    onError,
    onMessage,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    shouldReconnect = true,
    heartbeatInterval = 30000,
    heartbeatMessage = { type: 'ping' },
  } = options

  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const reconnectCount = useRef(0)
  const heartbeatIntervalId = useRef<NodeJS.Timeout | null>(null)

  // Parse WebSocket message
  const parseMessage = useCallback((messageEvent: MessageEvent): WebSocketMessage => {
    try {
      return JSON.parse(messageEvent.data)
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      return { type: 'unknown', payload: messageEvent.data }
    }
  }, [])

  // Handle incoming messages
  const handleMessage = useCallback(
    (messageEvent: MessageEvent) => {
      const parsedMessage = parseMessage(messageEvent)
      setLastMessage(parsedMessage)

      if (onMessage) {
        onMessage(parsedMessage)
      }
    },
    [parseMessage, onMessage],
  )

  // Setup heartbeat mechanism
  const setupHeartbeat = useCallback(
    (getWebSocket: () => WebSocketLike | null) => {
      if (heartbeatIntervalId.current) {
        clearInterval(heartbeatIntervalId.current)
      }

      heartbeatIntervalId.current = setInterval(() => {
        const ws = getWebSocket()
        if (ws && 'readyState' in ws && ws.readyState === ReadyState.OPEN && 'send' in ws) {
          if (typeof heartbeatMessage === 'string') {
            ws.send(heartbeatMessage)
          } else {
            ws.send(JSON.stringify(heartbeatMessage))
          }
        }
      }, heartbeatInterval)
    },
    [heartbeatInterval, heartbeatMessage],
  )

  // Handle WebSocket open event
  const handleOpen = useCallback(
    (event: WebSocketEventMap['open']) => {
      reconnectCount.current = 0

      if (onOpen) {
        onOpen(event)
      }
    },
    [onOpen],
  )

  // Connect and setup WebSocket
  const {
    sendMessage: sendMessageOriginal,
    readyState,
    getWebSocket,
  } = useWebSocketOriginal(url, {
    onOpen: (event: WebSocketEventMap['open']) => {
      handleOpen(event)
      setupHeartbeat(getWebSocket)
    },
    onClose: (event: WebSocketEventMap['close']) => {
      if (heartbeatIntervalId.current) {
        clearInterval(heartbeatIntervalId.current)
      }

      if (onClose) {
        onClose(event)
      }
    },
    onError,
    onMessage: handleMessage,
    reconnectAttempts,
    reconnectInterval,
    shouldReconnect: () => {
      reconnectCount.current += 1
      return shouldReconnect && reconnectCount.current <= reconnectAttempts
    },
  })

  // Enhanced sendMessage function
  const sendMessage = useCallback(
    (message: string | WebSocketMessage) => {
      if (typeof message === 'string') {
        sendMessageOriginal(message)
      } else {
        sendMessageOriginal(JSON.stringify(message))
      }
    },
    [sendMessageOriginal],
  )

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (heartbeatIntervalId.current) {
        clearInterval(heartbeatIntervalId.current)
      }
    }
  }, [])

  // Manual reconnect function
  const reconnect = useCallback(() => {
    reconnectCount.current = 0
    // Close and reopen the connection
    const ws = getWebSocket()
    if (ws && 'close' in ws) {
      ws.close()
      // The library will auto-reconnect based on shouldReconnect option
    }
  }, [getWebSocket])

  return {
    sendMessage,
    lastMessage,
    readyState,
    reconnect,
    getWebSocket,
    isConnecting: readyState === ReadyState.CONNECTING,
    isOpen: readyState === ReadyState.OPEN,
    isClosing: readyState === ReadyState.CLOSING,
    isClosed: readyState === ReadyState.CLOSED,
  }
}

export default useWebSocket
