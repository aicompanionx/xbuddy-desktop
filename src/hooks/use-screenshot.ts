import { useState } from 'react';

// Screenshot history item interface
export interface ScreenshotHistoryItem {
    path: string;
    base64Data?: string;
    result: string;
    timestamp?: Date;
}

export const useScreenshot = () => {
    // States
    const [screenshotPath, setScreenshotPath] = useState<string>('');
    const [screenshotBase64, setScreenshotBase64] = useState<string>('');
    const [screenshotHistory, setScreenshotHistory] = useState<ScreenshotHistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Convert file path to base64
    const pathToBase64 = async (filePath: string): Promise<string | null> => {
        try {
            // Use Electron API to read image and convert to base64
            const result = await window.electronAPI.convertImageToBase64(filePath);
            if (result.success && result.base64Data) {
                return `data:image/png;base64,${result.base64Data}`;
            }
            return null;
        } catch (err) {
            console.error('Image conversion failed:', err);
            return null;
        }
    };

    // Capture screen and save screenshot
    const captureScreen = async (): Promise<string | null> => {
        try {
            setLoading(true);
            const response = await window.electronAPI.captureScreen();
            if (response.success && response.path) {
                setScreenshotPath(response.path);
                
                // Convert to base64
                const base64Data = await pathToBase64(response.path);
                if (base64Data) {
                    setScreenshotBase64(base64Data);
                }
                
                return response.path;
            }
            return null;
        } catch (err) {
            console.error('Screen capture failed:', err);
            setError((err as Error).message || 'Screen capture failed');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Add screenshot to history
    const addToHistory = async (path: string, result: string) => {
        // Convert to base64
        const base64Data = await pathToBase64(path);
        
        const newItem: ScreenshotHistoryItem = {
            path,
            base64Data,
            result,
            timestamp: new Date()
        };
        setScreenshotHistory(prev => [newItem, ...prev]);
    };

    // Clear history
    const clearHistory = () => {
        setScreenshotHistory([]);
    };

    return {
        screenshotPath,
        screenshotBase64,
        screenshotHistory,
        loading,
        error,
        captureScreen,
        addToHistory,
        clearHistory
    };
}; 