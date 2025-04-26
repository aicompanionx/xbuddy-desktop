import { ipcRenderer } from 'electron'

/**
 * Window management related APIs
 */
export const windowApi = {
  // Create new window
  createWindow: async (options: { name: string; width?: number; height?: number; url?: string }) => {
    return await ipcRenderer.invoke('create-window', options)
  },

  // Get current window ID
  onWindowId: (callback: (windowId: string) => void) => {
    ipcRenderer.on('window-id', (_event, windowId) => callback(windowId))
    return () => {
      ipcRenderer.removeAllListeners('window-id')
    }
  },

  // Get list of all windows
  getAllWindows: async () => {
    return await ipcRenderer.invoke('get-all-windows')
  },

  // Send message to specific window
  sendMessageToWindow: (windowId: string, channel: string, data: unknown) => {
    ipcRenderer.send('send-to-window', { windowId, channel, data })
  },

  // Listen for messages from other windows
  onWindowMessage: (channel: string, callback: (data: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: unknown) => callback(data)
    ipcRenderer.on(channel, listener)

    // Return function to clear listener
    return () => {
      ipcRenderer.removeListener(channel, listener)
    }
  },

  // Send message to all windows
  sendMessageToAllWindows: (channel: string, data: unknown) => {
    ipcRenderer.send('send-to-all-windows', { channel, data })
  },

  // Create Live2D window
  createLive2DWindow: async (options: { width?: number; height?: number }) => {
    return await ipcRenderer.invoke('create-live2d-window', options)
  },

  // Create news window
  createNewsWindow: async (options: { width?: number; height?: number }) => {
    return await ipcRenderer.invoke('create-news-window', options)
  },

  // Create setting window
  createSettingWindow: async () => {
    return await ipcRenderer.invoke('create-setting-window')
  },

  // Create chat window
  createChatWindow: async () => {
    return await ipcRenderer.invoke('create-chat-window')
  },

  // Toggle window mouse event ignoring for click-through functionality
  toggleIgnoreMouseEvents: (options: { ignore: boolean; windowId: string; forward?: boolean }) => {
    ipcRenderer.send('toggle-ignore-mouse-events', options)
  },

  // Move window by delta (for dragging)
  moveWindow: (options: { windowId: string; x: number; y: number }) => {
    ipcRenderer.send('move-window', options)
  },

  // Set absolute window position
  setWindowPosition: (options: { windowId: string; x: number; y: number }) => {
    ipcRenderer.send('set-window-position', options)
  },

  // Get current window position
  getWindowPosition: async (windowId: string): Promise<{ x: number; y: number }> => {
    return await ipcRenderer.invoke('get-window-position', { windowId })
  },

  // Close current window
  closeCurrentWindow: () => {
    ipcRenderer.send('close-current-window')
  },
}
