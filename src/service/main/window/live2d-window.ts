import electron, { BrowserWindow, app } from 'electron';
import path from 'path';
import { WINDOWS_ID } from '@/constants/windowsId';
import { registerWindow, getMainWindow } from './window-registry';

const appPath = app.getAppPath();

/**
 * Create a Live2D window
 * @param width Window width
 * @param height Window height
 * @returns Created browser window
 */
export const createLive2DWindow = (width = 300, height = 450): BrowserWindow => {
    // Get primary display dimensions
    const { width: screenWidth, height: screenHeight } = electron.screen.getPrimaryDisplay().workAreaSize;

    // Create a transparent, frameless, always-on-top window
    const browserWindow = new BrowserWindow({
        width: width,
        height: height,
        x: 200,
        y: 200,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(appPath, '.vite', 'build', 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            spellcheck: false,
        },
        skipTaskbar: true, // Hide from taskbar
        resizable: false, // Prevent resizing
        focusable: true, // Can receive focus
        hasShadow: false, // No shadow
        backgroundColor: '#00000000', // Fully transparent background
        titleBarStyle: 'hidden',
        roundedCorners: false // Avoid rounded corners
    });
    const windowId = WINDOWS_ID.LIVE2D_CHARACTER;

    // Register window in the registry
    registerWindow(windowId, browserWindow);

    // Handle window load completion
    browserWindow.webContents.on('did-finish-load', () => {
        // Send window ID to the renderer process
        browserWindow.webContents.send('window-id', windowId);

        // Ensure window background is transparent
        browserWindow.setBackgroundColor('#00000000');

        // Make sure the main window is movable
        const mainWindow = getMainWindow();
        if (mainWindow) {
            mainWindow.setMovable(true);
        }
    });

    // Load Live2D page
    if (process.env.NODE_ENV === 'development') {
        // In development mode, load from Vite dev server with hash route
        browserWindow.loadURL('http://localhost:5173/#/live2d');

        // Comment out to disable DevTools in development
        // browserWindow.webContents.openDevTools();
    } else {
        // In production, load the built index.html with hash route
        browserWindow.loadFile(path.join(appPath, 'renderer/index.html'), {
            hash: 'live2d'
        });
    }

    return browserWindow;
}; 