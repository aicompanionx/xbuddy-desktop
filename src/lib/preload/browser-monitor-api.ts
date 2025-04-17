import { ipcRenderer } from 'electron';

/**
 * Browser Monitor API exposed to renderer process
 */
export const browserMonitorApi = {
    /**
     * Start browser monitoring
     * @returns Promise with result of the operation
     */
    startBrowserMonitoring: (): Promise<{ success: boolean; message: string }> => {
        return ipcRenderer.invoke('start-browser-monitoring');
    },

    /**
     * Stop browser monitoring
     * @returns Promise with result of the operation
     */
    stopBrowserMonitoring: (): Promise<{ success: boolean; message: string }> => {
        return ipcRenderer.invoke('stop-browser-monitoring');
    },

    /**
     * Get current browser monitoring status
     * @returns Promise with monitoring status
     */
    getBrowserMonitoringStatus: (): Promise<{ isRunning: boolean }> => {
        return ipcRenderer.invoke('get-browser-monitoring-status');
    },

    /**
     * Subscribe to browser monitoring data
     * @param callback Function to call when browser data is received
     * @returns Function to unsubscribe
     */
    onBrowserData: (callback: (data: any) => void): (() => void) => {
        const listener = (_event: any, data: any) => callback(data);
        ipcRenderer.on('browser-monitor-data', listener);

        // Return unsubscribe function
        return () => {
            ipcRenderer.removeListener('browser-monitor-data', listener);
        };
    }
}; 