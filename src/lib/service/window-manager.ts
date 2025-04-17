import { BrowserWindow, app, ipcMain } from 'electron';
import path from 'path';
import { handlePendingRoute } from './notification';

const appPath = app.getAppPath();

// Window registry to store all created windows
interface WindowsRegistry {
    [key: string]: BrowserWindow;
}

// Object to store all windows
const windows: WindowsRegistry = {};

// Reference to the main window
let mainWindow: BrowserWindow | null = null;

/**
 * Initialize IPC event listeners for window management
 */
export const initWindowManagerIPC = () => {
    // Handle window movement IPC messages
    ipcMain.on('move-live2d-window', (event, data) => {
        const { windowId, x, y } = data;
        const window = getWindowById(windowId);
        
        if (window) {
            const [currentX, currentY] = window.getPosition();
            window.setPosition(currentX + x, currentY + y);
        }
    });
    
    // Handle window position setting messages
    ipcMain.on('set-window-position', (event, data) => {
        const { windowId, x, y } = data;
        setWindowPosition(windowId, x, y);
    });
};

/**
 * Create a browser window
 * @param windowId Window ID, defaults to 'main'
 * @param width Window width, defaults to 800
 * @param height Window height, defaults to 600
 * @param url URL to load, optional
 * @returns Created browser window
 */
export const createWindow = (windowId = 'main', width = 800, height = 600, url?: string) => {
    // Create the browser window
    const browserWindow = new BrowserWindow({
        width,
        height,
        
        webPreferences: {
            preload: path.join(appPath, '.vite', 'build', 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: `Window - ${windowId}`,
    });

    // Save window reference
    windows[windowId] = browserWindow;

    // If this is the main window, set the global reference
    if (windowId === 'main') {
        mainWindow = browserWindow;
    }

    // Handle window load completion
    browserWindow.webContents.on('did-finish-load', () => {
        // Process any pending routes
        handlePendingRoute(browserWindow, windowId);

        // Send window ID to the renderer process
        browserWindow.webContents.send('window-id', windowId);
    });

    // When window is closed, remove from registry
    browserWindow.on('closed', () => {
        delete windows[windowId];
        if (windowId === 'main') {
            mainWindow = null;
        }
    });

    // Load content
    if (process.env.NODE_ENV === 'development') {
        // In development mode, load from Vite dev server
        browserWindow.loadURL(url || 'http://localhost:5173');
        // Open DevTools
        browserWindow.webContents.openDevTools();
    } else {
        // In production, load the built index.html
        browserWindow.loadFile(path.join(appPath, 'renderer/index.html'));
        // If a specific route is provided, add hash parameter
        if (url) {
            browserWindow.loadFile(path.join(appPath, 'renderer/index.html'), {
                hash: url.replace('http://localhost:5173', '')
            });
        }
    }

    return browserWindow;
};

/**
 * Create a secondary window
 * @param name Window name
 * @returns Created browser window
 */
export const createSecondaryWindow = (name: string) => {
    const id = `secondary-${name}-${Date.now()}`;
    return createWindow(id, 600, 500);
};

/**
 * Get all window IDs
 * @returns Array of window IDs
 */
export const getAllWindowIds = () => {
    return Object.keys(windows);
};

/**
 * Get window by ID
 * @param windowId Window ID
 * @returns Window instance or null if not found
 */
export const getWindowById = (windowId: string): BrowserWindow | null => {
    return windows[windowId] || null;
};

/**
 * Get the main window
 * @returns Main window instance
 */
export const getMainWindow = (): BrowserWindow | null => {
    return mainWindow;
};

/**
 * Create a Live2D window
 * @param width Window width
 * @param height Window height
 * @returns Created browser window
 */
export const createLive2DWindow = (width = 300, height = 450) => {
    const windowId = `live2d-${Date.now()}`;
    
    // Create a transparent, frameless, always-on-top window
    const browserWindow = new BrowserWindow({
        width,
        height,
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

    // Save window reference
    windows[windowId] = browserWindow;

    // Handle window load completion
    browserWindow.webContents.on('did-finish-load', () => {
        // Send window ID to the renderer process
        browserWindow.webContents.send('window-id', windowId);
        
        // Ensure window background is transparent
        browserWindow.setBackgroundColor('#00000000');
    });

    // When window is closed, remove from registry
    browserWindow.on('closed', () => {
        delete windows[windowId];
    });


    // Load Live2D page
    if (process.env.NODE_ENV === 'development') {
        // In development mode, load from Vite dev server with hash route
        browserWindow.loadURL('http://localhost:5173/#/live2d');

        browserWindow.webContents.openDevTools();
    } else {
        // In production, load the built index.html with hash route
        browserWindow.loadFile(path.join(appPath, 'renderer/index.html'), {
            hash: 'live2d'
        });
    }

    return browserWindow;
};

/**
 * Set window position
 * @param windowId Window ID
 * @param x X coordinate
 * @param y Y coordinate
 * @returns Success status
 */
export const setWindowPosition = (windowId: string, x: number, y: number): boolean => {
    const window = getWindowById(windowId);
    if (window) {
        window.setPosition(Math.round(x), Math.round(y));
        return true;
    }
    return false;
}; 