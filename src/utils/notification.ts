/**
 * Notification service that provides methods for sending notifications and handling notification click events
 */
export const NotificationService = {
    /**
     * Send system notification
     * @param title Notification title
     * @param body Notification content
     * @param route Route path to navigate to when notification is clicked
     */
    sendNotification: (title: string, body: string, route: string): void => {
        if (window.electronAPI) {
            window.electronAPI.sendNotification(title, body, route);
        } else {
            console.warn('electronAPI is not available');
        }
    },

    /**
     * Listen for notification click events
     * @param callback Callback function to handle click events
     */
    onNotificationClick: (callback: (route: string) => void): void => {
        if (window.electronAPI) {
            window.electronAPI.onNotificationClick(callback);
        } else {
            console.warn('electronAPI is not available');
        }
    },

    /**
     * Remove all notification click event listeners
     */
    removeNotificationListeners: (): void => {
        if (window.electronAPI) {
            window.electronAPI.removeNotificationListeners();
        } else {
            console.warn('electronAPI is not available');
        }
    }
};

export default NotificationService;
