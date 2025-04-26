import { ReadyState } from 'react-use-websocket'

// WebSocketLike 类型兼容 react-use-websocket 中的定义
export type WebSocketLike = WebSocket | EventSource

export enum WebSocketReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export type WebSocketMessage<T> = {
  type: string
  payload?: T
  data?: T
}

export type WebSocketOptions<T> = {
  onOpen?: (event: WebSocketEventMap['open']) => void
  onClose?: (event: WebSocketEventMap['close']) => void
  onError?: (event: WebSocketEventMap['error']) => void
  onMessage?: <T>(message: T) => void
  reconnectAttempts?: number
  reconnectInterval?: number
  shouldReconnect?: boolean
  heartbeatInterval?: number
  heartbeatMessage?: string | WebSocketMessage<T>
}

export type WebSocketHookResult<T> = {
  sendMessage: (message: string | WebSocketMessage<T>) => void
  lastMessage: WebSocketMessage<T> | null
  readyState: ReadyState
  reconnect: () => void
  getWebSocket: () => WebSocketLike | null
  isConnecting: boolean
  isOpen: boolean
  isClosing: boolean
  isClosed: boolean
}
