import React, { useEffect, useState } from 'react'
import { useAppStore } from '@/store/app'
import { Live2DContainerWithMenu } from '../components/features/live2d-container-with-menu'
import PhishingAlert, { UnsafeUrlAlert } from '../components/ui/phishing-alert'

const modelPath = `assets/live2d/shizuku/runtime/shizuku.model3.json`

const Live2DPage: React.FC = () => {
  const { selectWindow } = useAppStore()
  const [windowId, setWindowId] = useState<string>('')
  const [unsafeAlert, setUnsafeAlert] = useState<UnsafeUrlAlert | null>(null)
  const [alertVisible, setAlertVisible] = useState(false)

  // Get window ID and update app state
  useEffect(() => {
    const cleanup = window.electronAPI.onWindowId((id: string) => {
      setWindowId(id)
      console.log('Live2D Window ID:', id)
      selectWindow(id)
    })

    return cleanup
  }, [selectWindow])

  // Listen for unsafe URL notifications
  useEffect(() => {
    const unsubscribe = window.electronAPI.onUnsafeUrlDetected((result) => {
      console.log('Unsafe URL detected:', result)
      // Show alert with the unsafe URL information
      setUnsafeAlert({
        url: result.url,
        reason: result.reason || 'Potentially malicious website',
        timestamp: result.timestamp,
      })
      setAlertVisible(true)
    })

    return unsubscribe
  }, [])

  // Handle closing the alert
  const handleCloseAlert = () => {
    setAlertVisible(false)
    // Clear alert data after animation completes
    setTimeout(() => setUnsafeAlert(null), 500)
  }

  return (
    <>
      {windowId && (
        <Live2DContainerWithMenu windowId={windowId} modelPath={modelPath} autoResize={true} fullscreen={true} />
      )}

      {/* Phishing Alert Component */}
      {unsafeAlert && <PhishingAlert alert={unsafeAlert} visible={alertVisible} onClose={handleCloseAlert} />}
    </>
  )
}

export default Live2DPage
