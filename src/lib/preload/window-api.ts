import { ipcRenderer } from 'electron';

/**
 * Window management related APIs
 */
export const windowApi = {
    // Create new window
    createWindow: async (options: { name: string, width?: number, height?: number, url?: string }) => {
        return await ipcRenderer.invoke('create-window', options);
    },

    // Get current window ID
    onWindowId: (callback: (windowId: string) => void) => {
        ipcRenderer.on('window-id', (_event, windowId) => callback(windowId));
        return () => {
            ipcRenderer.removeAllListeners('window-id');
        };
    },

    // Get list of all windows
    getAllWindows: async () => {
        return await ipcRenderer.invoke('get-all-windows');
    },

    // Send message to specific window
    sendMessageToWindow: (windowId: string, channel: string, data: any) => {
        ipcRenderer.send('send-to-window', { windowId, channel, data });
    },

    // Listen for messages from other windows
    onWindowMessage: (channel: string, callback: (data: any) => void) => {
        const listener = (_event: Electron.IpcRendererEvent, data: any) => callback(data);
        ipcRenderer.on(channel, listener);

        // Return function to clear listener
        return () => {
            ipcRenderer.removeListener(channel, listener);
        };
    },

    // Create Live2D window
    createLive2DWindow: async (options: { width?: number, height?: number }) => {
        return await ipcRenderer.invoke('create-live2d-window', options);
    }
}; 