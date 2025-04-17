import { contextBridge, ipcRenderer } from 'electron';

// Exposed API
contextBridge.exposeInMainWorld('electronAPI', {
    // Notification related
    sendNotification: (options: { title: string; body: string; route?: string }) => {
        ipcRenderer.send('send-notification', options);
    },
    onNotificationClick: (callback: (route: string) => void) => {
        ipcRenderer.on('notification-clicked', (_event, route) => callback(route));
        return () => {
            ipcRenderer.removeAllListeners('notification-clicked');
        };
    },
    removeNotificationListeners: () => {
        ipcRenderer.removeAllListeners('notification-clicked');
    },

    // Multi-window management
    createWindow: (options: { name: string; width?: number; height?: number; url?: string }) => {
        return ipcRenderer.invoke('create-window', options);
    },
    onWindowId: (callback: (windowId: string) => void) => {
        ipcRenderer.on('window-id', (_event, id) => callback(id));
        return () => {
            ipcRenderer.removeAllListeners('window-id');
        };
    },
    getAllWindows: () => {
        return ipcRenderer.invoke('get-all-windows');
    },
    sendMessageToWindow: (windowId: string, channel: string, data: any) => {
        ipcRenderer.send('send-message-to-window', { windowId, channel, data });
    },
    sendToWindow: (options: { windowId: number; channel: string; data: any }) => {
        ipcRenderer.send('send-to-window', options);
    },
    onWindowMessage: (channel: string, callback: (data: any) => void) => {
        const listener = (_event: any, data: any) => callback(data);
        ipcRenderer.on(channel, listener);
        return () => {
            ipcRenderer.removeListener(channel, listener);
        };
    },
    getWindowType: () => {
        return ipcRenderer.invoke('get-window-type');
    },

    // Live2D window
    createLive2DWindow: (options: { width: number; height: number; hash?: string }) => {
        return ipcRenderer.invoke('create-live2d-window', options);
    },
    setWindowPosition: (options: { windowId: number; x: number; y: number }) => {
        ipcRenderer.send('set-window-position', options);
    },

    // Browser monitoring
    startBrowserMonitoring: () => {
        return ipcRenderer.invoke('start-browser-monitoring');
    },
    stopBrowserMonitoring: () => {
        return ipcRenderer.invoke('stop-browser-monitoring');
    },
    getBrowserMonitoringStatus: () => {
        return ipcRenderer.invoke('get-browser-monitoring-status');
    },
    onBrowserData: (callback: (data: any) => void) => {
        ipcRenderer.on('browser-data', (_event, data) => callback(data));
        return () => {
            ipcRenderer.removeAllListeners('browser-data');
        };
    },

    // URL safety check
    checkUrlSafety: (url: string) => {
        return ipcRenderer.invoke('check-url-safety', url);
    },
    clearUrlSafetyCache: () => {
        return ipcRenderer.invoke('clear-url-safety-cache');
    },

    // Unsafe URL detection
    onUnsafeUrlDetected: (callback: (result: any) => void) => {
        ipcRenderer.on('unsafe-url-detected', (_event, result) => callback(result));
        return () => {
            ipcRenderer.removeAllListeners('unsafe-url-detected');
        };
    },

    // Vision and AI model configuration
    setAIModelConfig: (config: { provider: string; apiKey: string; baseURL?: string; modelName?: string }) => {
        return ipcRenderer.invoke('set-ai-model-config', config);
    },
    setOpenAIConfig: (config: { apiKey: string; baseURL?: string }) => {
        return ipcRenderer.invoke('set-openai-config', config);
    },

    // Automation
    startAutomation: (options: any) => {
        return ipcRenderer.invoke('start-automation', options);
    },
    stopAutomation: () => {
        return ipcRenderer.invoke('stop-automation');
    },
    getAutomationStatus: () => {
        return ipcRenderer.invoke('get-automation-status');
    },
    executeGuiAction: (action: string) => {
        return ipcRenderer.invoke('execute-gui-action', action);
    },
    processGuiAction: (task: string, systemPrompt: string, actionHistory?: string[]) => {
        return ipcRenderer.invoke('process-gui-action', task, systemPrompt, actionHistory);
    },

    // Legacy API (Vision)
    analyzeScreenshot: (options?: any) => {
        return ipcRenderer.invoke('analyze-screenshot', options);
    },
    findElementByImage: (options: any) => {
        return ipcRenderer.invoke('find-element-by-image', options);
    },
    processInstruction: (instruction: string) => {
        return ipcRenderer.invoke('process-instruction', instruction);
    },
}); 