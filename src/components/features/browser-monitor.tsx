import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { UrlSafetyResult } from '../../lib/api/types'

// Define the browser data interface
interface BrowserData {
  url?: string
  process?: string
  active?: boolean
  time?: string
  title?: string
  status?: string
  message?: string
  error?: string
}

interface BrowserMonitorProps {
  autoStart?: boolean
}

export function BrowserMonitor({ autoStart = true }: BrowserMonitorProps) {
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [browsers, setBrowsers] = useState<BrowserData[]>([])
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [urlSafetyResults, setUrlSafetyResults] = useState<Map<string, UrlSafetyResult>>(new Map())

  // Check initial status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await window.electronAPI.getBrowserMonitoringStatus()
        setIsRunning(status.isRunning)

        // Auto-start monitoring if not already running and autoStart is true
        if (autoStart && !status.isRunning) {
          console.log('Auto-starting browser monitoring...')
          handleStart()
        }
      } catch (error) {
        console.error('Failed to get browser monitoring status:', error)
      }
    }

    checkStatus()
  }, [autoStart])

  // Setup browser data listener
  useEffect(() => {
    if (!isRunning) return

    // Subscribe to browser data events
    const unsubscribe = window.electronAPI.onBrowserData((data: BrowserData) => {
      // Handle status messages
      if (data.status) {
        setStatusMessage(`Status: ${data.status}${data.message ? ` - ${data.message}` : ''}`)
        return
      }

      // Handle error messages
      if (data.error) {
        setStatusMessage(`Error: ${data.error}`)
        return
      }

      // Handle browser data
      if (data.url) {
        setBrowsers((prev) => {
          // Check if we already have this URL in our list
          const existingIndex = prev.findIndex((b) => b.url === data.url && b.process === data.process)

          // Also check URL safety if we have a new URL
          if (existingIndex === -1) {
            try {
              checkUrlSafety(data.url)
            } catch (e) {
              console.error('Failed to check URL safety:', e)
            }
          }

          if (existingIndex >= 0) {
            // Update existing browser data
            const updated = [...prev]
            updated[existingIndex] = data
            return updated
          } else {
            // Add new browser data
            return [...prev, data]
          }
        })
      }
    })

    // Cleanup subscription on component unmount or when monitoring stops
    return () => {
      unsubscribe()
    }
  }, [isRunning])

  // Start browser monitoring
  const handleStart = async () => {
    try {
      const result = await window.electronAPI.startBrowserMonitoring()
      setStatusMessage(result.message)

      if (result.success) {
        setIsRunning(true)
        // Clear previous browser data when starting a new session
        setBrowsers([])
        // Also clear safety results
        setUrlSafetyResults(new Map())
      }
    } catch (error) {
      setStatusMessage(`Error starting monitoring: ${error}`)
    }
  }

  // Stop browser monitoring
  const handleStop = async () => {
    try {
      const result = await window.electronAPI.stopBrowserMonitoring()
      setStatusMessage(result.message)

      if (result.success) {
        setIsRunning(false)
      }
    } catch (error) {
      setStatusMessage(`Error stopping monitoring: ${error}`)
    }
  }

  // Function to check URL safety
  const checkUrlSafety = async (url: string) => {
    try {
      // Skip URLs we've already checked
      if (urlSafetyResults.has(url)) return

      const result = await window.electronAPI.checkUrlSafety(url)
      setUrlSafetyResults((prev) => {
        const updated = new Map(prev)
        updated.set(url, result)
        return updated
      })

      // If URL is unsafe, show a notification or visual warning
      if (!result.isSafe) {
        setStatusMessage(`Warning: ${result.reason || 'Potentially unsafe URL detected: ' + url}`)
      }
    } catch (error) {
      console.error('Failed to check URL safety:', error)
    }
  }

  // Get badge variant based on safety result
  const getSafetyBadgeVariant = (result: UrlSafetyResult) => {
    if (!result.isSafe) {
      // If risk score is available, use it to determine severity
      if (result.riskScore !== undefined) {
        if (result.riskScore >= 0.7) return 'destructive' // High risk
        if (result.riskScore >= 0.4) return 'secondary' // Medium risk (using secondary instead of warning)
      }
      return 'destructive' // Default for unsafe
    }
    return 'default' // Safe (using default instead of success)
  }

  // Get badge text based on safety result
  const getSafetyBadgeText = (result: UrlSafetyResult) => {
    if (!result.isSafe) {
      return 'Unsafe'
    }
    return 'Safe'
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Browser Activity Monitor
          <Badge variant={isRunning ? 'default' : 'secondary'}>{isRunning ? 'Running' : 'Stopped'}</Badge>
        </CardTitle>
        <CardDescription>Monitor browser activity across your system</CardDescription>
      </CardHeader>

      <CardContent>
        {statusMessage && <div className="mb-4 p-2 bg-muted rounded-md text-sm">{statusMessage}</div>}

        <div className="h-[400px] rounded-md border p-2 overflow-auto">
          {browsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {isRunning ? 'Waiting for browser activity...' : 'Start monitoring to see browser activity'}
            </p>
          ) : (
            <div className="space-y-4">
              {browsers.map((browser, index) => (
                <div key={`${browser.process}-${browser.url}-${index}`} className="p-3 rounded-lg bg-card border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{browser.process}</span>
                    <div className="flex gap-2">
                      {urlSafetyResults.has(browser.url) && (
                        <Badge variant={getSafetyBadgeVariant(urlSafetyResults.get(browser.url))}>
                          {getSafetyBadgeText(urlSafetyResults.get(browser.url))}
                        </Badge>
                      )}
                      <Badge variant={browser.active ? 'default' : 'outline'}>
                        {browser.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold truncate">{browser.title}</h4>
                  <p className="text-xs text-muted-foreground break-all">{browser.url}</p>

                  {browser.time && <p className="text-xs text-right mt-2 text-muted-foreground">{browser.time}</p>}

                  {/* Display warning details if unsafe URL */}
                  {urlSafetyResults.has(browser.url) && !urlSafetyResults.get(browser.url).isSafe && (
                    <div className="mt-2 p-2 bg-red-50 text-red-800 text-xs rounded border border-red-200">
                      <strong>Warning:</strong>{' '}
                      {urlSafetyResults.get(browser.url).reason || 'Potentially unsafe website'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        {isRunning ? (
          <Button variant="destructive" onClick={handleStop}>
            Stop Monitoring
          </Button>
        ) : (
          <Button onClick={handleStart}>Start Monitoring</Button>
        )}
      </CardFooter>
    </Card>
  )
}
