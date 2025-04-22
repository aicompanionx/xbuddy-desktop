import { ipcMain } from 'electron'
import { createNotification } from './notification'
import { getAllWindowIds, getWindowById, getMainWindow, createLive2DWindow, createWindow } from './window'
import { ApiResponse, RequestOptions } from './api/api-client'
import { browserMonitorService } from './browser-monitor'

// Import internal HTTP request function
import fetch, { RequestInit } from 'node-fetch'

/**
 * Send HTTP request
 * @param options Request options
 * @returns Promise<ApiResponse>
 */
async function sendHttpRequest<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
  const { method, url, data, headers = {}, timeout = 30000 } = options

  // Set request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  // Add request body (if not GET request)
  if (method !== 'GET' && data) {
    requestOptions.body = JSON.stringify(data)
  }

  try {
    // Send request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    requestOptions.signal = controller.signal

    const response = await fetch(url, requestOptions)
    clearTimeout(timeoutId)

    // Parse response body
    let responseData: T
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      responseData = (await response.json()) as T
    } else {
      responseData = (await response.text()) as unknown as T
    }

    // Convert response headers to object
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, name) => {
      responseHeaders[name] = value
    })

    // Return formatted response
    return {
      data: responseData,
      status: response.status,
      headers: responseHeaders,
    }
  } catch (error) {
    // Handle errors
    console.error('HTTP request error:', error)
    throw error
  }
}

/**
 * Setup all IPC communication handlers
 */
export const setupIpcHandlers = () => {
  // Handle notification requests
  ipcMain.on('send-notification', (_event, { title, body, route }) => {
    createNotification(title, body, route, getMainWindow())
  })

  // Listen for create new window requests
  ipcMain.handle('create-window', (_event, { name }) => {
    // Implementation for creating windows by name can be added here if needed
    const window = createWindow()
    return window.id
  })

  // Listen for get all windows requests
  ipcMain.handle('get-all-windows', () => {
    return getAllWindowIds()
  })

  // Listen for send message to specific window requests
  ipcMain.on('send-to-window', (_event, { windowId, channel, data }) => {
    const targetWindow = getWindowById(windowId)
    if (targetWindow) {
      targetWindow.webContents.send(channel, data)
    }
  })

  // Listen for create Live2D window requests
  ipcMain.handle('create-live2d-window', (_event, { width, height }) => {
    const window = createLive2DWindow(width, height)
    return window.id
  })

  // Handle HTTP API requests
  ipcMain.handle('api-request', async (_event, options: RequestOptions) => {
    try {
      // Use HTTP request function to send request
      const response = await sendHttpRequest(options)
      return response
    } catch (error) {
      console.error('API request error:', error)
      // Return formatted error response
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
        data: null,
        headers: {},
      }
    }
  })

  // Set browser monitor main window
  const mainWindow = getMainWindow()
  if (mainWindow) {
    browserMonitorService.setMainWindow(mainWindow)
  }

  // Handle browser monitoring requests
  ipcMain.handle('start-browser-monitoring', async () => {
    return await browserMonitorService.startMonitoring()
  })

  ipcMain.handle('stop-browser-monitoring', async () => {
    return await browserMonitorService.stopMonitoring()
  })

  ipcMain.handle('get-browser-monitoring-status', () => {
    return browserMonitorService.getStatus()
  })
}
