import React, { useEffect } from 'react'
import { useAlert } from '@/contexts/alert-context'
import TokenSafetyAlert from '@/components/show-alert/token-safety-alert'
import PhishingAlert from '@/components/ui/phishing-alert'
import NewsAlert from '@/components/show-alert/news-alert'
import { useLive2DMenu } from '@/contexts/live2d-menu-context'

interface Live2DAlertsProps {
  containerRef: React.RefObject<HTMLDivElement>
  menuOpen: boolean
}

export const Live2DAlerts = ({ containerRef, menuOpen }: Live2DAlertsProps) => {
  // Use AlertContext to manage alert states
  const { state, showPhishingAlert, showTokenSafetyAlert, closeAlert } = useAlert()
  const { setIsMenuOpen } = useLive2DMenu()

  // Listen for unsafe URL notifications
  useEffect(() => {
    const unsubscribeUnsafe = window.electronAPI.onUnsafeUrlDetected((result) => {
      console.log('Unsafe URL detected:', result)
      showPhishingAlert(result)
      setIsMenuOpen(false)
    })

    return () => {
      unsubscribeUnsafe()
    }
  }, [showPhishingAlert, setIsMenuOpen])

  // Listen for token safety notifications
  useEffect(() => {
    const unsubscribeTokenSafety = window.electronAPI.onTokenSafetyDetected((result) => {
      console.log('Token safety detected:', result)
      showTokenSafetyAlert(result)
      setIsMenuOpen(false)
    })

    return () => {
      unsubscribeTokenSafety()
    }
  }, [showTokenSafetyAlert, setIsMenuOpen])

  useEffect(() => {
    if (state.activeAlert && menuOpen) {
      setIsMenuOpen(false)
    }
  }, [state.activeAlert, menuOpen, setIsMenuOpen])

  return (
    <>
      {/* Phishing alert component - only show when alert is active and menu is closed */}
      <PhishingAlert
        alert={state.phishingAlert}
        isActive={state.activeAlert === 'phishing' && !menuOpen}
        onClose={closeAlert}
        referenceElement={containerRef}
      />

      {/* Token safety alert component - only show when alert is active and menu is closed */}
      <TokenSafetyAlert
        alert={state.tokenSafetyAlert}
        isActive={state.activeAlert === 'tokenSafety' && !menuOpen}
        referenceElement={containerRef}
        onClose={closeAlert}
      />

      {/* News alert component */}
      <NewsAlert referenceElement={containerRef} />
    </>
  )
}
