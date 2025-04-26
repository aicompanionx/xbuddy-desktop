import { BrowserWindow, app } from 'electron'
import path from 'path'
import { handlePendingRoute } from '../notification'
import { WINDOWS_ID } from '@/constants/windowsId'
import { registerWindow } from './window-registry'

const appPath = app.getAppPath()

export const createChatWindow = (url?: string): BrowserWindow => {
    const windowId = WINDOWS_ID.CHAT
    // const { width, height } = scree  n.getPrimaryDisplay().workAreaSize

    const minWidth = 400
    const minHeight = 600

    const browserWindow = new BrowserWindow({
        width: minWidth,
        height: minHeight,

        minWidth: minWidth,
        minHeight: minHeight,

        webPreferences: {
            preload: path.join(appPath, '.vite', 'build', 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: `Chat`,
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
        browserWindow.loadURL(url || 'http://localhost:5173/#/chat')
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
