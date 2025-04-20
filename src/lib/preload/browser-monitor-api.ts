import { ipcRenderer } from 'electron';

/**
 * Browser monitor API exposed to renderer
 */
export const browserMonitorApi = {
    /**
     * Start browser monitoring
     * @returns Promise with result of the operation
     */
    startMonitoring: (): Promise<{ success: boolean; message: string }> => {
        return ipcRenderer.invoke('start-browser-monitor');
    },

    /**
     * Stop browser monitoring
     * @returns Promise with result of the operation
     */
    stopMonitoring: (): Promise<{ success: boolean; message: string }> => {
        return ipcRenderer.invoke('stop-browser-monitor');
    },

    /**
     * Get browser monitoring status
     * @returns Promise with monitoring status
     */
    getStatus: (): Promise<{ isRunning: boolean }> => {
        return ipcRenderer.invoke('get-browser-monitor-status');
    },

    /**
     * Subscribe to browser data events
     * @param callback Function to call when browser data is received
     * @returns Function to unsubscribe
     */
    onBrowserData: (callback: (data: any) => void) => {
        const listener = (_event: any, data: any) => callback(data);
        ipcRenderer.on('browser-data', listener);
        return () => ipcRenderer.removeListener('browser-data', listener);
    },

    /**
     * Subscribe to unsafe URL detection events
     * @param callback Function to call when unsafe URL is detected
     * @returns Function to unsubscribe
     */
    onUnsafeUrl: (callback: (data: any) => void) => {
        const listener = (_event: any, data: any) => callback(data);
        ipcRenderer.on('unsafe-url-detected', listener);
        return () => ipcRenderer.removeListener('unsafe-url-detected', listener);
    }
}; 