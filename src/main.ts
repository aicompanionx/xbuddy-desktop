import { app, BrowserWindow } from 'electron';
import { createWindow, initWindowManagerIPC } from './lib/service/window-manager';
import { setupIpcHandlers } from './lib/service/ipc-handler';
import { setupAutomationHandlers } from './lib/service/automation-service';
import { setupVisionHandlers } from './lib/service/vision-service';
import { setupBrowserMonitorHandlers, startBrowserMonitoring } from './lib/service/browser-monitor-service';
import { setupUrlSafetyHandlers } from './lib/service/url-safety-service';

// Handle squirrel events during installation
if (require('electron-squirrel-startup')) {
    app.quit();
}

/**
 * Start browser monitoring and auto-create Live2D character window
 */
const startAppServices = async () => {
    console.log('Starting app services...');

    // Start browser monitoring automatically
    const monitorResult = await startBrowserMonitoring();
    console.log('Browser monitoring start result:', monitorResult);

    // Delay needed to ensure main window is ready
    setTimeout(() => {
        // Get main window
        const windows = BrowserWindow.getAllWindows();
        const mainWindow = windows.find(w => w.webContents.getURL().includes('main'));

        if (mainWindow) {
            // Send command to renderer to create Live2D window
            console.log('Sending command to create Live2D window');
            mainWindow.webContents.send('auto-create-live2d');
        }
    }, 2000);
};

// Called when Electron has finished initialization and is ready to create browser windows
app.whenReady().then(() => {
    // Set up IPC listeners
    setupIpcHandlers();
    
    // Set up automation service listeners
    setupAutomationHandlers();
    
    // Set up vision analysis service listeners
    setupVisionHandlers();
    
    // Set up browser monitor service listeners
    setupBrowserMonitorHandlers();

    // Set up URL safety service listeners
    setupUrlSafetyHandlers();

    // Initialize window manager IPC events
    initWindowManagerIPC();

    // Create main window
    createWindow();

    // Start browser monitoring and other services
    startAppServices();

    // Handle macOS app activation
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit the application when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
}); 