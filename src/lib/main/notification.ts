import { Notification, BrowserWindow, app } from 'electron';
import path from 'path';

const appPath = app.getAppPath();

// Global variable to store current active window and route path
let pendingRoute: string | null = null;

/**
 * Create system notification
 * @param title Notification title
 * @param body Notification content
 * @param route Route to navigate when notification is clicked
 * @param mainWindow Main window reference
 */
export const createNotification = (
    title: string,
    body: string,
    route: string,
    mainWindow: BrowserWindow | null
) => {
    const notification = new Notification({
        title,
        body,
        silent: false,
        icon: path.join(appPath, 'assets/icon.png')
    });

    // Store route for use when notification is clicked
    notification.addListener('click', () => {
        pendingRoute = route;

        // Restore window if minimized or hidden
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();

            // Send notification click event to renderer process
            mainWindow.webContents.send('notification-clicked', route);
        }
    });

    notification.show();
};

/**
 * Handle notification routing after window loads
 * @param browserWindow Browser window instance
 * @param windowId Window ID
 */
export const handlePendingRoute = (browserWindow: BrowserWindow, windowId: string) => {
    if (pendingRoute && windowId === 'main') {
        browserWindow.webContents.send('notification-clicked', pendingRoute);
        pendingRoute = null;
    }
};

/**
 * Get current pending route
 */
export const getPendingRoute = () => pendingRoute;

/**
 * Set pending route
 */
export const setPendingRoute = (route: string | null) => {
    pendingRoute = route;
};