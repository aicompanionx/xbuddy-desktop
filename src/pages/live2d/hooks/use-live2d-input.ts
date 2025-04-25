import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useChat } from './use-chat'

interface UseLive2DInputProps {
    isVisible: boolean
    onClose: () => void
}

export const useLive2DInput = ({ isVisible, onClose }: UseLive2DInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [inputValue, setInputValue] = useState('')
    const [isMultiline, setIsMultiline] = useState(false)
    const [commentList, setCommentList] = useState<string[]>([])
    const [useMultipleComments, setUseMultipleComments] = useState(false)
    const { onSend, chatList } = useChat()

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value
        setInputValue(value)

        setIsMultiline(event.target.value.includes('\n') || event.target.scrollHeight > 50)

        if (useMultipleComments) {
            setCommentList(value.split('\n').filter((comment) => comment.trim() !== ''))
        }
    }

    const handleSend = () => {
        if (inputValue.trim() === '') {
            console.error('inputValue is empty')
            return
        }

        onSend(inputValue)
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isVisible) {
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isVisible, onClose])

    useEffect(() => {
        if (isVisible && textareaRef.current) {
            setTimeout(() => {
                textareaRef.current?.focus()
            }, 100)
        }
    }, [isVisible])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !useMultipleComments) {
            e.preventDefault()
            handleSend()
        } else if (e.key === 'Enter' && e.shiftKey) {
            setIsMultiline(true)
        }
    }

    const handleHeightChange = (height: number) => {
        setIsMultiline(height > 40)
    }

    return {
        chatList,
        textareaRef,
        inputValue,
        setInputValue,
        isMultiline,
        commentList,
        useMultipleComments,
        setUseMultipleComments,
        handleInputChange,
        handleSend,
        handleKeyDown,
        handleHeightChange
    }
} 