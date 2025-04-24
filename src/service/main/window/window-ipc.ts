import { ipcMain } from 'electron';
import { getWindowById, getMainWindow, setWindowPosition } from './window-registry';

/**
 * Initialize IPC event listeners for window management
 */
export const initWindowManagerIPC = () => {
    // Handle window movement IPC messages (relative movement)
    ipcMain.on('move-window', (event, data) => {
        const { windowId, x, y } = data;
        const window = getWindowById(windowId);

        if (window) {
            const [currentX, currentY] = window.getPosition();
            // Use setWindowPosition to ensure boundary checking
            setWindowPosition(windowId, currentX + x, currentY + y);
        }
    });

    // For backward compatibility - to be deprecated
    ipcMain.on('move-live2d-window', (event, data) => {
        const { windowId, x, y } = data;
        const window = getWindowById(windowId);

        if (window) {
            const [currentX, currentY] = window.getPosition();
            // Use setWindowPosition to ensure boundary checking
            setWindowPosition(windowId, currentX + x, currentY + y);
        }
    });

    // Handle window position setting messages (absolute positioning)
    ipcMain.on('set-window-position', (event, data) => {
        const { windowId, x, y } = data;
        setWindowPosition(windowId, x, y);
    });

    // Handle get window position request
    ipcMain.handle('get-window-position', (event, { windowId }) => {
        const window = getWindowById(windowId);
        if (window) {
            const [x, y] = window.getPosition();
            return { x, y };
        }
        return { x: 0, y: 0 }; // Default position if window not found
    });

    ipcMain.on('close-live2d-window', (_event, { windowId }) => {
        const window = getWindowById(windowId);
        if (window) {
            window.close();
        }
    });

    ipcMain.on('minimize-live2d-window', (_event, { windowId }) => {
        const window = getWindowById(windowId);
        if (window) {
            window.minimize();
        }
    });

    ipcMain.on('open-live2d-settings', (_event, { windowId }) => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
            mainWindow.webContents.send('open-live2d-settings-dialog', { windowId });
        }
    });

    registerGenericWindowEvents();
};

const registerGenericWindowEvents = () => {
    ipcMain.on('toggle-ignore-mouse-events', (_event, { ignore, windowId, forward = true }) => {
        const window = getWindowById(windowId);
        if (window) {
            window.setIgnoreMouseEvents(ignore, { forward });
        }
    });
}; 