import { useState, useRef } from 'react'

/**
 * Hook for managing text input and comment operations
 * 
 * This hook handles input field management, text area resizing,
 * and comment list operations.
 */
export const useInputManagement = (initialValue = '') => {
    // Input state
    const [inputValue, setInputValue] = useState(initialValue)
    const [isMultiline, setIsMultiline] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const inputContainerRef = useRef<HTMLDivElement>(null)
    /**
     * Handle textarea height adjustment
     */
    const handleHeightChange = (height: number) => {
        setIsMultiline(height > 40)
    }

    /**
     * Handle input value changes
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value)
    }

    /**
     * Handle keyboard events
     * @param callback - Callback to execute on Enter press
     */
    const createKeyDownHandler = (callback: () => void) => {
        return (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                callback()
            }
        }
    }

    /**
     * Clear input and reset text area height
     */
    const resetInput = () => {
        setInputValue('')
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
        setIsMultiline(false)
    }

    return {
        // State
        inputValue,
        isMultiline,
        textareaRef,
        inputContainerRef,

        // Setters
        setInputValue,
        handleInputChange,
        handleHeightChange,
        createKeyDownHandler,
        resetInput
    }
} 