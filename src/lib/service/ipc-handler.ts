import { ipcMain } from 'electron';
import { createNotification } from './notification';
import {
    createSecondaryWindow,
    getAllWindowIds,
    getWindowById,
    getMainWindow,
    createLive2DWindow,
    setWindowPosition
} from './window-manager';
import { setupImageHandlers } from './image-service';

/**
 * Setup all IPC communication handlers
 */
export const setupIpcHandlers = () => {
    // Setup image processing service
    setupImageHandlers();
    
    // Handle notification requests
    ipcMain.on('send-notification', (_event, { title, body, route }) => {
        createNotification(title, body, route, getMainWindow());
    });

    // Listen for create new window requests
    ipcMain.handle('create-window', (_event, { name }) => {
        const window = createSecondaryWindow(name);
        return window.id;
    });

    // Listen for get all windows requests
    ipcMain.handle('get-all-windows', () => {
        return getAllWindowIds();
    });

    // Listen for send message to specific window requests
    ipcMain.on('send-to-window', (_event, { windowId, channel, data }) => {
        const targetWindow = getWindowById(windowId);
        if (targetWindow) {
            targetWindow.webContents.send(channel, data);
        }
    });

    // Listen for create Live2D window requests
    ipcMain.handle('create-live2d-window', (_event, { width, height }) => {
        const window = createLive2DWindow(width, height);
        return window.id;
    });
    
    // Listen for set window position requests
    ipcMain.on('set-window-position', (_event, { windowId, x, y }) => {
        setWindowPosition(windowId, x, y);
    });
}; 