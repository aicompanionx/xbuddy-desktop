import { ipcMain, BrowserWindow } from 'electron';
import { safetyApi, UrlSafetyResult } from './api/safety-api';

/**
 * Setup URL safety check IPC handlers
 */
export const setupUrlSafetyHandlers = (): void => {
    // Handle URL safety check requests
    ipcMain.handle('check-url-safety', async (_event, url: string) => {
        try {
            const result = await safetyApi.checkUrlSafety(url);

            // Only log unsafe URLs
            if (!result.isSafe) {
                // Notify Live2D window about unsafe URL
                notifyLive2DWindowAboutUnsafeUrl(result);
            }

            return result;
        } catch (error) {
            console.error('Error checking URL safety:', error);
            return {
                url,
                isSafe: false,
                reason: 'Error checking URL safety: ' + (error instanceof Error ? error.message : String(error)),
                timestamp: Date.now()
            };
        }
    });

    // Handle cache clear requests
    ipcMain.handle('clear-url-safety-cache', () => {
        try {
            safetyApi.clearCache();
            return { success: true, message: 'URL safety cache cleared' };
        } catch (error) {
            console.error('Error clearing URL safety cache:', error);
            return {
                success: false,
                error: 'Failed to clear cache: ' + (error instanceof Error ? error.message : String(error))
            };
        }
    });
};

/**
 * Notify Live2D window about unsafe URL
 * @param unsafeResult The URL safety check result
 */
function notifyLive2DWindowAboutUnsafeUrl(unsafeResult: UrlSafetyResult): void {
    try {
        // Get all windows
        const windows = BrowserWindow.getAllWindows();

        // Find Live2D window(s)
        const live2dWindows = windows.filter(win => {
            const url = win.webContents.getURL();
            return url.includes('/live2d');
        });

        if (live2dWindows.length > 0) {
            console.log(`Sending unsafe URL notification to ${live2dWindows.length} Live2D windows`);

            // Send notification to all Live2D windows
            live2dWindows.forEach(win => {
                win.webContents.send('unsafe-url-detected', unsafeResult);
            });
        } else {
            // If no Live2D windows found, notify all windows
            windows.forEach(win => {
                if (!win.isDestroyed()) {
                    win.webContents.send('unsafe-url-detected', unsafeResult);
                }
            });
        }
    } catch (error) {
        console.error('Error notifying Live2D window:', error);
    }
}