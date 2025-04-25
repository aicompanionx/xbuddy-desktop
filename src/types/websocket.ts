import { ReadyState } from 'react-use-websocket'

// WebSocketLike 类型兼容 react-use-websocket 中的定义
export type WebSocketLike = WebSocket | EventSource

export enum WebSocketReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export type WebSocketMessage = {
  type: string
  payload?: any
}

export type WebSocketOptions = {
  onOpen?: (event: WebSocketEventMap['open']) => void
  onClose?: (event: WebSocketEventMap['close']) => void
  onError?: (event: WebSocketEventMap['error']) => void
  onMessage?: (message: WebSocketMessage) => void
  reconnectAttempts?: number
  reconnectInterval?: number
  shouldReconnect?: boolean
  heartbeatInterval?: number
  heartbeatMessage?: string | WebSocketMessage
}

export type WebSocketHookResult = {
  sendMessage: (message: string | WebSocketMessage) => void
  lastMessage: WebSocketMessage | null
  readyState: ReadyState
  reconnect: () => void
  getWebSocket: () => WebSocketLike | null
  isConnecting: boolean
  isOpen: boolean
  isClosing: boolean
  isClosed: boolean
}
