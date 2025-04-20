import React, { useRef, useState, useEffect } from 'react'
import Live2DCharacter from './live2d-character'
import { useLive2DDrag } from '@/hooks/use-live2d-drag'
import PhishingAlert, { UnsafeUrlAlert } from '@/components/ui/phishing-alert'
import Live2DMenu from '@/components/ui/live2d-menu'
import { CLASSNAME } from '@/constants/classname'

interface Live2DContainerProps {
  windowId: string
  modelPath: string
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
  autoResize?: boolean
  fullscreen?: boolean
}

export const Live2DContainer: React.FC<Live2DContainerProps> = ({ windowId, modelPath, width = 300, height = 400 }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [unsafeAlert, setUnsafeAlert] = useState<UnsafeUrlAlert | null>(null)
  const [alertVisible, setAlertVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Use drag hook
  const { isDragging } = useLive2DDrag(containerRef)

  // Container style - make it completely transparent
  const containerStyle = {
    position: 'relative',
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(${window.innerWidth - width}px, ${window.innerHeight - height}px)`,
    background: 'transparent',
  } as React.CSSProperties

  // Listen for unsafe URL notifications
  useEffect(() => {
    const unsubscribe = window.electronAPI.onUnsafeUrlDetected((result) => {
      console.log('Unsafe URL detected:', result)
      // Display alert with unsafe URL information
      setUnsafeAlert({
        url: result.url,
        reason: result.reason || 'Potential malicious website',
        timestamp: result.timestamp,
      })
      setAlertVisible(true)
    })

    return unsubscribe
  }, [])

  // Handle closing alert
  const handleCloseAlert = () => {
    setAlertVisible(false)
    // Clear alert data after animation completes
    setTimeout(() => setUnsafeAlert(null), 500)
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    if (isDragging) return
    e.stopPropagation()
    setMenuOpen(true)
  }

  const handleCloseMenu = () => {
    setMenuOpen(false)
  }

  const leftButtons = [
    {
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => console.log('Settings button clicked'),
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      color: 'bg-yellow-500 hover:bg-yellow-600',
      onClick: () => console.log('Switch model button clicked'),
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
          />
        </svg>
      ),
    },
    {
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => console.log('Skin button clicked'),
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      ),
    },
  ]

  const rightButtons = [
    {
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Interaction button clicked'),
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => console.log('Voice button clicked'),
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
    },
    {
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: handleCloseMenu,
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  ]

  return (
    <div ref={containerRef} style={containerStyle} onAuxClick={handleContainerClick}>
      <Live2DMenu isOpen={menuOpen} onClose={handleCloseMenu} leftButtons={leftButtons} rightButtons={rightButtons} />

      {/* Phishing alert component */}
      {unsafeAlert && <PhishingAlert alert={unsafeAlert} visible={alertVisible} onClose={handleCloseAlert} />}
      <Live2DCharacter windowId={windowId} modelPath={modelPath} width={width} height={height} centerModel={true} />
    </div>
  )
}
