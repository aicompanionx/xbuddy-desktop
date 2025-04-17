import { useState, useEffect, useCallback } from 'react';

// 窗口操作钩子
export function useElectronWindows() {
    const [windowId, setWindowId] = useState<string | null>(null);
    const [windows, setWindows] = useState<string[]>([]);

    // 获取当前窗口 ID
    useEffect(() => {
        const cleanup = window.electronAPI.onWindowId((id) => {
            setWindowId(id);
        });

        return cleanup;
    }, []);

    // 获取所有窗口列表
    const refreshWindows = useCallback(async () => {
        try {
            const allWindows = await window.electronAPI.getAllWindows();
            setWindows(allWindows);
            return allWindows;
        } catch (error) {
            console.error('获取窗口列表失败:', error);
            return [];
        }
    }, []);

    // 初始化时获取窗口列表
    useEffect(() => {
        refreshWindows();
    }, [refreshWindows]);

    // 创建新窗口
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
            console.error('创建窗口失败:', error);
            return -1;
        }
    }, [refreshWindows]);

    // 发送消息到其他窗口
    const sendMessage = useCallback((targetWindowId: string, channel: string, data: any) => {
        if (!targetWindowId || targetWindowId === windowId) return;
        window.electronAPI.sendMessageToWindow(targetWindowId, channel, data);
    }, [windowId]);

    // 向所有其他窗口广播消息
    const broadcastMessage = useCallback((channel: string, data: any) => {
        windows.forEach(id => {
            if (id !== windowId) {
                window.electronAPI.sendMessageToWindow(id, channel, data);
            }
        });
    }, [windows, windowId]);

    // 监听来自其他窗口的消息
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