import { useState, useEffect, useCallback } from 'react';

// Window operations hook
export function useElectronWindows() {
    const [windowId, setWindowId] = useState<string | null>(null);
    const [windows, setWindows] = useState<string[]>([]);

    // Get current window ID
    useEffect(() => {
        const cleanup = window.electronAPI.onWindowId((id) => {
            setWindowId(id);
        });

        return cleanup;
    }, []);

    // Get all windows list
    const refreshWindows = useCallback(async () => {
        try {
            const allWindows = await window.electronAPI.getAllWindows();
            setWindows(allWindows);
            return allWindows;
        } catch (error) {
            console.error('Failed to get windows list:', error);
            return [];
        }
    }, []);

    // Initialize window list on mount
    useEffect(() => {
        refreshWindows();
    }, [refreshWindows]);

    // Create new window
    const createWindow = useCallback(async (
        name: string,
        width?: number,
        height?: number,
        url?: string
    ) => {
        try {
            const winId = await window.electronAPI.createWindow({
                name,
                width,
                height,
                url
            });
            await refreshWindows();
            return winId;
        } catch (error) {
            console.error('Failed to create window:', error);
            return -1;
        }
    }, [refreshWindows]);

    // Send message to other window
    const sendMessage = useCallback((targetWindowId: string, channel: string, data: any) => {
        if (!targetWindowId || targetWindowId === windowId) return;
        window.electronAPI.sendMessageToWindow(targetWindowId, channel, data);
    }, [windowId]);

    // Broadcast message to all other windows
    const broadcastMessage = useCallback((channel: string, data: any) => {
        windows.forEach(id => {
            if (id !== windowId) {
                window.electronAPI.sendMessageToWindow(id, channel, data);
            }
        });
    }, [windows, windowId]);

    // Listen for messages from other windows
    const useWindowMessage = (channel: string, callback: (data: any) => void) => {
        useEffect(() => {
            const cleanup = window.electronAPI.onWindowMessage(channel, callback);
            return cleanup;
        }, [channel, callback]);
    };

    return {
        windowId,
        windows,
        refreshWindows,
        createWindow,
        sendMessage,
        broadcastMessage,
        useWindowMessage
    };
}