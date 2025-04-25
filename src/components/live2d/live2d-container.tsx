import React, { useRef, useState, useEffect, memo } from 'react'
import { IoChatboxSharp, IoSettingsOutline } from 'react-icons/io5'
import { FaExchangeAlt } from 'react-icons/fa'
import { HiMiniSpeakerWave } from 'react-icons/hi2'
import { RiNewspaperLine } from 'react-icons/ri'
import { IoMdClose } from 'react-icons/io'

import Live2DCharacter from './live2d-character'
import { useLive2DDrag } from '@/pages/live2d/hooks/use-live2d-drag'
import PhishingAlert from '@/components/ui/phishing-alert'
import { useAlert } from '@/contexts/alert-context'
import TokenSafetyAlert from '../show-alert/token-safety-alert'
import Live2DMenu from './live2d-menu'
import NewsAlert from '../show-alert/news-alert'

interface Live2DContainerProps {
  windowId: string
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
  autoResize?: boolean
  fullscreen?: boolean
}

export const Live2DContainer = memo(({ windowId, width = 300, height = 400 }: Live2DContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Use AlertContext to manage alert states
  const { state, showPhishingAlert, showTokenSafetyAlert, closeAlert } = useAlert()

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
    const unsubscribeUnsafe = window.electronAPI.onUnsafeUrlDetected((result) => {
      console.log('Unsafe URL detected:', result)
      // Display unsafe URL alert
      showPhishingAlert(result)
    })

    return () => {
      unsubscribeUnsafe()
    }
  }, [showPhishingAlert])

  // Listen for token safety notifications
  useEffect(() => {
    const unsubscribeTokenSafety = window.electronAPI.onTokenSafetyDetected((result) => {
      console.log('Token safety detected:', result)
      showTokenSafetyAlert(result)
    })

    return () => {
      unsubscribeTokenSafety()
    }
  }, [showTokenSafetyAlert])

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
      icon: <IoChatboxSharp size={20} />,
    },
    {
      color: 'bg-yellow-500 hover:bg-yellow-600',
      onClick: () => console.log('Switch model button clicked'),
      icon: <FaExchangeAlt />,
    },
    {
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => console.log('Skin button clicked'),
      icon: <IoSettingsOutline size={20} />,
    },
  ]

  const rightButtons = [
    {
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Interaction button clicked'),
      icon: <HiMiniSpeakerWave size={20} />,
    },
    {
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => {
        handleCloseMenu()
      },
      icon: <RiNewspaperLine size={20} />,
    },
    {
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: handleCloseMenu,
      icon: <IoMdClose size={20} />,
    },
  ]

  return (
    <div ref={containerRef} style={containerStyle} onAuxClick={handleContainerClick}>
      <Live2DMenu isOpen={menuOpen} onClose={handleCloseMenu} leftButtons={leftButtons} rightButtons={rightButtons} />

      {/* Phishing alert component */}
      <PhishingAlert
        alert={state.phishingAlert}
        isActive={state.activeAlert === 'phishing'}
        onClose={closeAlert}
        referenceElement={containerRef}
      />

      {/* Token safety alert component */}
      <TokenSafetyAlert
        alert={state.tokenSafetyAlert}
        isActive={state.activeAlert === 'tokenSafety'}
        referenceElement={containerRef}
        onClose={closeAlert}
      />

      {/* News alert component */}
      <NewsAlert referenceElement={containerRef} />

      <Live2DCharacter windowId={windowId} width={width} height={height} centerModel={true} />
    </div>
  )
})

export default Live2DContainer
