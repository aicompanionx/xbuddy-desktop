import { ipcRenderer } from 'electron'
import { TwitterAccountInfo } from '../main/api/twitter/type'

/**
 * URL safety check result interface
 */
export interface UrlSafetyResult {
  url: string
  isPhishing: boolean
  message?: string
  timestamp?: number
}

/**
 * URL safety API exposed to renderer process
 */
export const urlSafetyApi = {
  /**
   * Check if a URL is safe
   * @param url URL to check
   * @returns Promise with safety check result
   */
  checkUrlSafety: (url: string): Promise<UrlSafetyResult> => {
    return ipcRenderer.invoke('check-url-safety', url)
  },

  /**
   * Clear URL safety cache
   * @returns Promise with operation result
   */
  clearCache: (): Promise<{ success: boolean; message?: string; error?: string }> => {
    return ipcRenderer.invoke('clear-url-safety-cache')
  },

  /**
   * Register a callback for unsafe URL detection
   * @param callback Function to call when an unsafe URL is detected
   * @returns Unsubscribe function
   */
  onUnsafeUrlDetected: (callback: (result: UrlSafetyResult) => void): (() => void) => {
    const listener = (_event: any, result: UrlSafetyResult) => callback(result)
    ipcRenderer.on('unsafe-url-detected', listener)
    return () => ipcRenderer.removeListener('unsafe-url-detected', listener)
  },
}
