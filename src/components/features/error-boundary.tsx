import React, { ReactNode, useState, useEffect } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  onError?: () => void
  fallback?: ReactNode | ((reset: () => void) => ReactNode)
}

/**
 * Error Boundary Component
 *
 * Catches and handles errors in its child component tree.
 * Provides fallback UI when errors occur.
 */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, onError, fallback }) => {
  const [hasError, setHasError] = useState(false)

  // Reset error state
  const resetError = () => {
    setHasError(false)
  }

  useEffect(() => {
    // Error event handler
    const handleErrorEvent = (event: ErrorEvent) => {
      event.preventDefault()
      setHasError(true)
      if (onError) onError()
    }

    // Set up global error handler
    window.addEventListener('error', handleErrorEvent)

    return () => {
      window.removeEventListener('error', handleErrorEvent)
    }
  }, [onError])

  // Render fallback UI if there's an error
  if (hasError) {
    // If fallback is a function, call it with reset function
    if (typeof fallback === 'function') {
      return <>{fallback(resetError)}</>
    }

    // If fallback is a React node, render it
    if (fallback) {
      return <>{fallback}</>
    }

    // Default fallback UI
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
        <div className="text-red-500 mb-4">Something went wrong</div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={resetError}>
          Try Again
        </button>
      </div>
    )
  }

  // Use try-catch for synchronous errors in rendering
  try {
    return <>{children}</>
  } catch (error) {
    // Handle synchronous errors
    setHasError(true)
    if (onError) onError()
    return null
  }
}
