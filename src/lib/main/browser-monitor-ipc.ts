import { ipcMain, BrowserWindow } from 'electron';
import { browserMonitorService } from './browser-monitor-service';

/**
 * Setup IPC handlers for browser monitoring
 * @param mainWindow Main browser window reference
 * @param autoStart Whether to automatically start monitoring (default: true)
 */
export function setupBrowserMonitorIPC(mainWindow: BrowserWindow, autoStart = true): void {
    // Set main window in service
    browserMonitorService.setMainWindow(mainWindow);

    // Start browser monitoring
    ipcMain.handle('start-browser-monitor', async () => {
        return browserMonitorService.startMonitoring();
    });

    // Stop browser monitoring
    ipcMain.handle('stop-browser-monitor', async () => {
        return browserMonitorService.stopMonitoring();
    });

    // Get browser monitoring status
    ipcMain.handle('get-browser-monitor-status', async () => {
        return browserMonitorService.getStatus();
    });

    // Automatically start monitoring if autoStart is true
    if (autoStart) {
        // Start monitoring after a short delay to ensure window is ready
        setTimeout(async () => {
            const result = await browserMonitorService.startMonitoring();
            console.log('Auto-started browser monitoring:', result.message);
        }, 1000);
    }
} 