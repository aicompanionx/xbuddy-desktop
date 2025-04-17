import { app, BrowserWindow } from 'electron';
import { createWindow, initWindowManagerIPC } from './lib/service/window-manager';
import { setupIpcHandlers } from './lib/service/ipc-handler';
import { setupAutomationHandlers } from './lib/service/automation-service';
import { setupVisionHandlers } from './lib/service/vision-service';

// Handle squirrel events during installation
if (require('electron-squirrel-startup')) {
    app.quit();
}

// Called when Electron has finished initialization and is ready to create browser windows
app.whenReady().then(() => {
    // Set up IPC listeners
    setupIpcHandlers();
    
    // Set up automation service listeners
    setupAutomationHandlers();
    
    // Set up vision analysis service listeners
    setupVisionHandlers();
    
    // Initialize window manager IPC events
    initWindowManagerIPC();

    // Create main window
    createWindow();

    // Handle macOS app activation
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit the application when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
}); 