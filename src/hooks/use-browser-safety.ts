import { useState, useEffect, useCallback } from 'react'
import { UrlSafetyResult } from '../lib/preload/url-safety-api'

interface BrowserSafetyHook {
  // Monitoring state
  isMonitoring: boolean
  // Latest browser data
  browserData: any | null
  // Unsafe URLs
  unsafeUrls: UrlSafetyResult[]
  // Start monitoring
  startMonitoring: () => Promise<void>
  // Stop monitoring
  stopMonitoring: () => Promise<void>
  // Clear unsafe URLs list
  clearUnsafeUrls: () => void
}

/**
 * Hook for browser safety monitoring functionality
 */
export function useBrowserSafety(): BrowserSafetyHook {
  // Monitoring status
  const [isMonitoring, setIsMonitoring] = useState(false)
  // Browser data
  const [browserData, setBrowserData] = useState<any | null>(null)
  // Unsafe URLs
  const [unsafeUrls, setUnsafeUrls] = useState<UrlSafetyResult[]>([])

  // Check initial status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await window.electronAPI.getBrowserMonitoringStatus()
        setIsMonitoring(status.isRunning)
      } catch (error) {
        console.error('Failed to get browser monitoring status:', error)
      }
    }

    checkStatus()
  }, [])

  // Listen for browser data
  useEffect(() => {
    if (!window.electronAPI) {
      console.error('Electron API not available')
      return
    }

    const unsubscribe = window.electronAPI.onBrowserData((data) => {
      setBrowserData(data)
    })

    return unsubscribe
  }, [])

  // Listen for unsafe URLs
  useEffect(() => {
    if (!window.electronAPI) {
      console.error('Electron API not available')
      return
    }

    const unsubscribe = window.electronAPI.onUnsafeUrlDetected((result: UrlSafetyResult) => {
      setUnsafeUrls((prev) => {
        // Check if URL is already in the list
        if (prev.some((item) => item.url === result.url)) {
          return prev
        }
        return [...prev, result]
      })
    })

    return unsubscribe
  }, [])

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    try {
      const result = await window.electronAPI.startBrowserMonitoring()
      if (result.success) {
        setIsMonitoring(true)
      } else {
        console.error('Failed to start monitoring:', result.message)
      }
    } catch (error) {
      console.error('Error starting browser monitoring:', error)
    }
  }, [])

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    try {
      const result = await window.electronAPI.stopBrowserMonitoring()
      if (result.success) {
        setIsMonitoring(false)
      } else {
        console.error('Failed to stop monitoring:', result.message)
      }
    } catch (error) {
      console.error('Error stopping browser monitoring:', error)
    }
  }, [])

  // Clear unsafe URLs
  const clearUnsafeUrls = useCallback(() => {
    setUnsafeUrls([])
  }, [])

  return {
    isMonitoring,
    browserData,
    unsafeUrls,
    startMonitoring,
    stopMonitoring,
    clearUnsafeUrls,
  }
}
