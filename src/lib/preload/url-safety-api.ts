import { ipcRenderer } from 'electron';

/**
 * URL safety API exposed to renderer process
 */
export const urlSafetyApi = {
    /**
     * Check if a URL is safe (not a phishing site)
     * @param url The URL to check
     * @returns Promise with URL safety check result
     */
    checkUrlSafety: (url: string): Promise<{
        url: string;
        isSafe: boolean;
        riskScore?: number;
        category?: string;
        reason?: string;
        timestamp: number;
    }> => {
        return ipcRenderer.invoke('check-url-safety', url);
    },

    /**
     * Clear the URL safety cache
     */
    clearUrlSafetyCache: (): Promise<{ success: boolean }> => {
        return ipcRenderer.invoke('clear-url-safety-cache');
    }
}; 