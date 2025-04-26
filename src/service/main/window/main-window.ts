import { BrowserWindow, app, screen } from 'electron'
import path from 'path'
import { handlePendingRoute } from '../notification'
import { WINDOWS_ID } from '@/constants/windowsId'
import { registerWindow } from './window-registry'

const appPath = app.getAppPath()

export const createMainWindow = (url?: string): BrowserWindow => {
  const windowId = WINDOWS_ID.MAIN
  // Get screen size
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  const browserWindow = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    transparent: false,
    backgroundColor: '#00000000',
    frame: false,
    maximizable: false,
    resizable: false,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(appPath, '.vite', 'build', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: `Xbuddy`,
  })

  registerWindow(windowId, browserWindow)

  browserWindow.webContents.on('did-finish-load', () => {
    handlePendingRoute(browserWindow, windowId)

    if (!app.isPackaged && process.env.NODE_ENV === 'development') {
      browserWindow.webContents.openDevTools()
    }

    browserWindow.webContents.send('window-id', windowId)
  })

  if (process.env.NODE_ENV === 'development') {
    browserWindow.loadURL(url || 'http://localhost:5173/#/live2d')
  } else {
    browserWindow.loadFile(path.join(appPath, 'renderer/index.html'))

    if (url) {
      browserWindow.loadFile(path.join(appPath, 'renderer/index.html'), {
        hash: url.replace('http://localhost:5173', ''),
      })
    }
  }

  return browserWindow
}
