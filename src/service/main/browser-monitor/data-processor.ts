import { BrowserWindow } from 'electron'
import { BrowserTabData } from './types'
import { shouldAnalyzeUrl, analyzeUrlForPhishing, analyzeUrlForToken } from './url-analyzer'

// Buffer for accumulating data from monitor
let dataBuffer = ''

/**
 * Reset data buffer
 */
export const resetDataBuffer = (): void => {
  dataBuffer = ''
}

/**
 * Process data received from monitor
 * @param data Raw data from monitor process
 * @param mainWindow Main window reference
 */
export const processMonitorData = (data: Buffer, mainWindow: BrowserWindow | null): void => {
  const rawOutput = data.toString()

  dataBuffer += rawOutput

  // Extract complete JSON objects from buffer
  let processedIndex = 0
  let startPos = 0

  while (startPos < dataBuffer.length) {
    try {
      // Find a complete JSON object
      const endPos = dataBuffer.indexOf('\n', startPos)
      if (endPos === -1) {
        // No newline found, wait for more data
        break
      }

      const jsonStr = dataBuffer.substring(startPos, endPos).trim()
      if (!jsonStr) {
        // Empty line, skip
        startPos = endPos + 1
        continue
      }

      // Parse as JSON
      const jsonData = JSON.parse(jsonStr) as BrowserTabData
      processedIndex = endPos + 1

      // Send data to renderer process
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('browser-monitor-data', jsonData)

        // Check if this is an active tab with a URL that should be analyzed
        if (jsonData.active && jsonData.url && shouldAnalyzeUrl(jsonData.url)) {
          // Choose different analysis methods based on the URL
          if (
            jsonData.url.startsWith('https://gmgn.ai/') ||
            jsonData.url.startsWith('https://dexscreener.com/') ||
            jsonData.url.startsWith('https://x.com/')
          ) {
            void analyzeUrlForToken(jsonData.url, mainWindow)
          } else {
            void analyzeUrlForPhishing(jsonData.url, mainWindow)
          }
        }
      }

      startPos = endPos + 1
    } catch (error) {
      // If JSON parsing fails, try the next line
      const nextNewline = dataBuffer.indexOf('\n', startPos + 1)
      if (nextNewline === -1) {
        // No more newlines, wait for more data
        break
      }
      startPos = nextNewline + 1
      console.error('Error parsing browser monitor data:', error)
    }
  }

  // Remove processed data from buffer
  if (processedIndex > 0) {
    dataBuffer = dataBuffer.substring(processedIndex)
  }
}
