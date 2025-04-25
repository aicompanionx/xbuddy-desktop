import { useWebsocket } from "@/hooks/use-websocket"
import { storageUtil } from "@/utils/storage"
import { useState, useEffect } from "react"

interface ChatRequest {
    lang: string;
    content: string;
}

interface ChatResponse {
    message: string,
    code: "0" | "1"
}

interface EmitEvent {
    chat: ChatRequest;
    [key: string]: unknown;
}

interface OnEvent {
    chat: ChatResponse;
    [key: string]: unknown;
}

export const useChat = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [chatList, setChatList] = useState<string[]>([])

    const { getLanguageCode } = storageUtil()

    const onMessage = (message: MessageEvent<string>) => {
        const data = JSON.parse(message.data)
        if (data.code === 0) {

            if (/\.|。/.test(data.message)) {
                console.log('check sentence');
            }
            setChatList(prev => [...prev, data.message])
        }

    }


    const ws = useWebsocket<OnEvent, EmitEvent>('ws://192.168.2.16:8000/api/v1/token-analysis/ws', { disabled: false, onMessage, })

    const onSend = (chat: string) => {
        setIsLoading(true)
        ws.emit('chat', {
            lang: getLanguageCode(),
            content: chat
        })

        setChatList(prev => [...prev, chat])
    }


    return {
        chatList,
        setChatList,
        onSend,
        isLoading
    }
}
