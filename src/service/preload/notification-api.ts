import { ipcRenderer } from 'electron';

/**
 * Notification related APIs
 */
export const notificationApi = {
    // Send notification
    sendNotification: (title: string, body: string, route: string) => {
        ipcRenderer.send('send-notification', { title, body, route });
    },

    // Listen for notification click events
    onNotificationClick: (callback: (route: string) => void) => {
        ipcRenderer.on('notification-clicked', (_event, route) => callback(route));
    },

    // Remove notification click listeners
    removeNotificationListeners: () => {
        ipcRenderer.removeAllListeners('notification-clicked');
    }
}; 