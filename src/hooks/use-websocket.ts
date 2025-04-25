import { useEffect, useMemo } from 'react'
import useReactWebSocket, { Options, ReadyState } from 'react-use-websocket'

import { useEmitter, type OnEvents, type EmitEvents } from './use-emitter'

const filterHeartbeta = (message: MessageEvent<string>) => {
  try {
    const msg = JSON.parse(message.data)
    return msg.type !== 'heartbeat'
  } catch (error) {
    console.error('[filterHeartbeta error]', error)
    return true
  }
}

interface WsBase<T extends OnEvents> {
  type: keyof T
  data: T[keyof T]
}

interface WsOptions extends Options {
  disabled?: boolean
}

/** Based on `react-use-websocket`, binding {@link WsBase} data format. */
export const useWebsocket = <
  OEvents extends OnEvents,
  EEvents extends EmitEvents
>(
  url: string,
  { disabled, ...options }: WsOptions = {}
) => {
  type AllEvents = OEvents & EEvents

  const emitter = useEmitter<OEvents, AllEvents>() // `EmitEvents` must contain all events
  const { lastJsonMessage, sendJsonMessage, ...ws } = useReactWebSocket<
    WsBase<OEvents> // Ws only can received events
  >(
    url,
    {
      retryOnError: true,
      reconnectAttempts: 5,
      reconnectInterval: 3_000,
      heartbeat: {
        message: () => JSON.stringify({ type: 'ping' }),
        interval: 30_000, // 30s
      },
      onOpen: () => sendJsonMessage({ type: 'ping' }),
      filter: filterHeartbeta,
      ...options,
    },
    !disabled
  )
  const [isConnecting, isOpen, isClosing, isClosed] = useMemo(
    () => [
      ws.readyState === ReadyState.CONNECTING,
      ws.readyState === ReadyState.OPEN,
      ws.readyState === ReadyState.CLOSING,
      ws.readyState === ReadyState.CLOSED,
    ],
    [ws.readyState]
  )

  // Emit an event, cannot use `emitter.emit`,
  // because we need to send message to websocket.
  const emit = <T extends keyof EEvents>(type: T, data: EEvents[T]) => {
    if (!isOpen) {
      throw new Error('[useWebsocket]: websocket not connected')
    }
    sendJsonMessage({ type, data })
    emitter.emit(type, data as AllEvents[T])
  }

  // Listen all events, it's only contain `OEvents`
  useEffect(() => {
    if (!lastJsonMessage) return
    const { type, ...data } = lastJsonMessage

    emitter.emit(type, data as unknown as AllEvents[typeof type])
  }, [lastJsonMessage])

  return {
    ...ws,
    isConnecting,
    isOpen,
    isClosing,
    isClosed,
    on: emitter.on,
    emit,
    off: emitter.off,
    offAll: emitter.offAll,
  }
}
