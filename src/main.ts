import './lib/main/init-env'

import { app, BrowserWindow } from 'electron'
import { createWindow, initWindowManagerIPC } from './lib/main/window'
import { setupIpcHandlers } from './lib/main/ipc-handler'
import { setupUrlSafetyHandlers } from './lib/main/url-safety-service'
import { setupBrowserMonitorIPC } from './lib/main/browser-monitor-ipc'
import { browserMonitorService } from './lib/main/browser-monitor'

// Configuration
const AUTO_START_BROWSER_MONITOR = true // Control whether browser monitoring starts automatically

// Handle squirrel events during installation
if (require('electron-squirrel-startup')) {
  app.quit()
}

// Called when Electron has finished initialization and is ready to create browser windows
app.whenReady().then(() => {
  // Set up IPC listeners
  setupIpcHandlers()

  // Set up URL safety service listeners
  setupUrlSafetyHandlers()

  // Initialize window manager IPC events
  initWindowManagerIPC()

  // Create main window
  const mainWindow = createWindow()

  // Set up browser monitor IPC handlers with the main window
  setupBrowserMonitorIPC(mainWindow, AUTO_START_BROWSER_MONITOR)

  // Handle macOS app activation
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit the application when all windows are closed, except on macOS
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') app.quit()

  // Stop browser monitoring
  await browserMonitorService.stopMonitoring()
})
