import { setMainWindow, startMonitoring, stopMonitoring, getStatus } from './service'

/**
 * Browser Monitor Service
 * Responsible for managing communication with the browser monitoring program
 */
export const browserMonitorService = {
  setMainWindow,
  startMonitoring,
  stopMonitoring,
  getStatus,
}

// Export types for use in other modules
export * from './types'
