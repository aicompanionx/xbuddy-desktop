import './service/main/init-env'

import { app, BrowserWindow } from 'electron'
import { createWindow, initWindowManagerIPC } from './service/main/window'
import { setupIpcHandlers } from './service/main/ipc-handler'
import { setupBrowserMonitorIPC } from './service/main/browser-monitor-ipc'
import { browserMonitorService } from './service/main/browser-monitor'
import { setupTwitterRaidIPC } from './service/main/twitter-raid/twitter-raid-ipc'

// Configuration
const AUTO_START_BROWSER_MONITOR = true // Control whether browser monitoring starts automatically

// Handle squirrel events during installation
if (process.platform === 'win32') {
  try {
    if (require('electron-squirrel-startup')) {
      app.quit()
    }
  } catch (e) {
    console.error('electron-squirrel-startup not found, continuing anyway')
  }
}

// app.disableHardwareAcceleration()

// Called when Electron has finished initialization and is ready to create browser windows
app.whenReady().then(() => {
  // Set up IPC listeners
  setupIpcHandlers()

  // Set up URL safety service listeners
  // setupUrlSafetyHandlers()

  // Initialize window manager IPC events
  initWindowManagerIPC()

  // Initialize Twitter Raid IPC
  setupTwitterRaidIPC()

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
