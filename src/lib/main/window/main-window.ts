import { BrowserWindow, app } from 'electron';
import path from 'path';
import { handlePendingRoute } from '../notification';
import { WINDOWS_ID } from '@/constants/windowsId';
import { registerWindow } from './window-registry';

const appPath = app.getAppPath();

export const createMainWindow = (width = 800, height = 600, url?: string): BrowserWindow => {
    const windowId = WINDOWS_ID.MAIN;
    const browserWindow = new BrowserWindow({
        width,
        height,
        transparent: true,
        frame: false,
        maximizable: false,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(appPath, '.vite', 'build', 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: `Window - ${windowId}`,
    });

    registerWindow(windowId, browserWindow);

    browserWindow.webContents.on('did-finish-load', () => {
        handlePendingRoute(browserWindow, windowId);

        browserWindow.webContents.send('window-id', windowId);
    });

    if (process.env.NODE_ENV === 'development') {
        browserWindow.loadURL(url || 'http://localhost:5173/#/live2d');
        // browserWindow.webContents.openDevTools();
    } else {
        browserWindow.loadFile(path.join(appPath, 'renderer/index.html'));

        if (url) {
            browserWindow.loadFile(path.join(appPath, 'renderer/index.html'), {
                hash: url.replace('http://localhost:5173', '')
            });
        }
    }

    return browserWindow;
}; 