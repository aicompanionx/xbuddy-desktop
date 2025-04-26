import { app, BrowserWindow, Menu, MenuItemConstructorOptions } from 'electron'
import path from 'path'
import { registerWindow } from './window-registry'
import { WINDOWS_ID } from '@/constants/windowsId'

let newsWindow: BrowserWindow | null = null
const appPath = app.getAppPath()

export function createNewsWindow(width = 800, height = 600) {
  newsWindow = new BrowserWindow({
    width,
    height,
    frame: true,
    titleBarStyle: 'default',
    alwaysOnTop: false,
    center: true,
    minimizable: true,
    minWidth: width,
    minHeight: height,
    maximizable: true,
    closable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(appPath, '.vite', 'build', 'preload.js'),
    },
    title: `News`,
  })

  // Create custom menu
  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [{ role: 'close' }],
    },
    {
      label: 'Edit',
      submenu: [{ role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }],
    },
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  newsWindow.setMenu(menu)

  registerWindow(WINDOWS_ID.NEWS, newsWindow)

  if (process.env.NODE_ENV === 'development') {
    newsWindow.loadURL(`http://localhost:5173/#/news`)
  } else {
    newsWindow.loadFile(path.join(appPath, 'renderer/index.html'))
  }

  return newsWindow
}
