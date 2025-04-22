import { BrowserWindow } from 'electron'
import { isProcessRunning, startMonitorProcess, stopMonitorProcess } from './process-manager'
import { clearAnalyzedUrls } from './url-analyzer'

// Service state
let isMonitoring = false
let mainWindow: BrowserWindow | null = null

/**
 * Set the main window reference
 * @param window Main window instance
 */
export const setMainWindow = (window: BrowserWindow): void => {
  mainWindow = window
}

/**
 * Start browser monitoring
 * @returns Operation result
 */
export const startMonitoring = async (): Promise<{ success: boolean; message: string }> => {
  if (isMonitoring) {
    return { success: true, message: 'Browser monitoring is already running' }
  }

  try {
    // Clear analyzed URLs when starting monitoring
    clearAnalyzedUrls()

    // Start the monitor process
    const result = await startMonitorProcess(mainWindow, (code) => {
      // Process exit handler
      isMonitoring = false
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('browser-monitor-data', {
          status: 'stopped',
          code,
        })
      }
    })

    // Update monitoring state based on result
    isMonitoring = result.success
    return result
  } catch (error) {
    isMonitoring = false
    console.error('Error in startMonitoring:', error)
    return {
      success: false,
      message: `Failed to start monitoring: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Stop browser monitoring
 * @returns Operation result
 */
export const stopMonitoring = async (): Promise<{ success: boolean; message: string }> => {
  if (!isMonitoring) {
    return { success: true, message: 'Browser monitoring is not running' }
  }

  try {
    const result = await stopMonitorProcess()
    isMonitoring = false
    return result
  } catch (error) {
    isMonitoring = false
    return {
      success: false,
      message: `Failed to stop monitoring: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * Get monitoring status
 * @returns Current monitoring status
 */
export const getStatus = (): { isRunning: boolean } => {
  return { isRunning: isMonitoring && isProcessRunning() }
}
