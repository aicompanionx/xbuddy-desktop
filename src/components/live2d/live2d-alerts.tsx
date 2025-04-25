import React, { useEffect } from 'react'
import { useAlert } from '@/contexts/alert-context'
import TokenSafetyAlert from '@/components/show-alert/token-safety-alert'
import PhishingAlert from '@/components/ui/phishing-alert'

interface Live2DAlertsProps {
  containerRef: React.RefObject<HTMLDivElement>
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

export const Live2DAlerts = ({ containerRef, menuOpen, setMenuOpen }: Live2DAlertsProps) => {
  // Use AlertContext to manage alert states
  const { state, showPhishingAlert, showTokenSafetyAlert, closeAlert } = useAlert()

  // Listen for unsafe URL notifications
  useEffect(() => {
    const unsubscribeUnsafe = window.electronAPI.onUnsafeUrlDetected((result) => {
      console.log('Unsafe URL detected:', result)
      showPhishingAlert(result)
      setMenuOpen(false)
    })

    return () => {
      unsubscribeUnsafe()
    }
  }, [showPhishingAlert, setMenuOpen])

  // Listen for token safety notifications
  useEffect(() => {
    const unsubscribeTokenSafety = window.electronAPI.onTokenSafetyDetected((result) => {
      console.log('Token safety detected:', result)
      showTokenSafetyAlert(result)
      setMenuOpen(false)
    })

    return () => {
      unsubscribeTokenSafety()
    }
  }, [showTokenSafetyAlert, setMenuOpen])

  useEffect(() => {
    if (state.activeAlert && menuOpen) {
      setMenuOpen(false)
    }
  }, [state.activeAlert, menuOpen, setMenuOpen])

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
    </>
  )
}
