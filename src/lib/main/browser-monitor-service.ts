import { BrowserWindow, app, ipcMain } from 'electron';
import { spawn, ChildProcess, SpawnOptions, exec } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { safetyApi } from './api/safety-api';

/**
 * Browser Monitor Service
 * Responsible for managing communication with the browser monitoring program
 */
// Internal state variables
let monitorProcess: ChildProcess | null = null;
let isMonitoring = false;
let mainWindow: BrowserWindow | null = null;
let dataBuffer = '';

// Track analyzed URLs to prevent duplicate analysis
const analyzedUrls = new Set<string>();

/**
 * Interface for browser monitor data
 */
interface BrowserTabData {
    url: string;
    title?: string;
    process?: string;
    active: boolean;
    timestamp?: number;
    status?: string;
    error?: boolean;
    message?: string;
}

/**
 * Set the main window reference
 * @param window Main window instance
 */
const setMainWindow = (window: BrowserWindow): void => {
    mainWindow = window;
};

/**
 * Check if URL should be analyzed
 * @param url URL to check
 * @returns True if URL should be analyzed
 */
const shouldAnalyzeUrl = (url: string): boolean => {
    // Skip about:, chrome:, edge:, file: and empty URLs
    if (
        !url ||
        url.startsWith('about:') ||
        url.startsWith('chrome:') ||
        url.startsWith('edge:') ||
        url.startsWith('file:') ||
        url.startsWith('devtools:')
    ) {
        return false;
    }

    // Skip URLs that have already been analyzed recently
    if (analyzedUrls.has(url)) {
        return false;
    }

    return true;
};

/**
 * Analyze URL for phishing
 * @param url URL to analyze
 */
const analyzeUrlForPhishing = async (url: string): Promise<void> => {
    try {
        // Add to analyzed set
        analyzedUrls.add(url);

        // Limit the size of the analyzed URLs set to prevent memory leaks
        if (analyzedUrls.size > 1000) {
            const iterator = analyzedUrls.values();
            analyzedUrls.delete(iterator.next().value);
        }

        // Directly check URL safety using the safety API
        console.log(`Analyzing active URL for phishing: ${url}`);
        const result = await safetyApi.checkUrlSafety(url);

        // If there's a main window, inform it about the check result
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('url-safety-result', result);
        }

        // Auto-clear URL from analyzed set after some time
        setTimeout(() => {
            analyzedUrls.delete(url);
        }, 60 * 60 * 1000); // Remove after 1 hour to allow re-analysis
    } catch (error) {
        console.error('Error analyzing URL for phishing:', error);
    }
};

/**
 * Make file executable (for non-Windows platforms)
 * @param filePath Path to executable file
 */
const makeExecutable = async (filePath: string): Promise<void> => {
    if (process.platform === 'win32') return;

    return new Promise((resolve, reject) => {
        exec(`chmod +x "${filePath}"`, (error) => {
            if (error) {
                console.warn(`Failed to make file executable: ${error.message}`);
                // Continue anyway, it might already be executable
            }
            resolve();
        });
    });
};

/**
 * Get executable path based on platform
 * @returns Object containing executable path and args
 */
const getMonitorExecutablePath = (): { execPath: string; args: string[] } => {
    const platform = os.platform();

    // Determine base path for the executable
    const basePath = app.isPackaged
        ? path.dirname(app.getAppPath())
        : app.getAppPath();

    const binPath = path.join(basePath, 'src', 'lib', 'bin');
    let execPath: string;
    const args: string[] = [];

    // Python script path (for fallback)
    const pythonScriptPath = path.join(binPath, 'browser_monitor.py');

    if (platform === 'win32') {
        execPath = path.join(binPath, 'browser_monitor.exe');
        // Fallback to Python for development
        if (!fs.existsSync(execPath)) {
            console.log('Binary not found, falling back to Python script');
            execPath = 'python';
            args.push(pythonScriptPath);
        }
    } else if (platform === 'darwin') {
        execPath = path.join(binPath, 'browser_monitor');
        // Fallback to Python for development
        if (!fs.existsSync(execPath)) {
            console.log('Binary not found, falling back to Python script');
            execPath = 'python3';
            args.push(pythonScriptPath);
        }
    } else if (platform === 'linux') {
        execPath = path.join(binPath, 'browser_monitor');
        // Fallback to Python for development
        if (!fs.existsSync(execPath)) {
            console.log('Binary not found, falling back to Python script');
            execPath = 'python3';
            args.push(pythonScriptPath);
        }
    } else {
        throw new Error(`Unsupported operating system: ${platform}`);
    }

    console.log(`Monitor path: ${execPath}, args: ${args.join(' ')}`);
    return { execPath, args };
};

/**
 * Process data received from monitor
 * @param data Raw data from monitor process
 */
const processMonitorData = (data: Buffer): void => {
    const rawOutput = data.toString();

    dataBuffer += rawOutput;

    // Extract complete JSON objects from buffer
    let processedIndex = 0;
    let startPos = 0;

    while (startPos < dataBuffer.length) {
        try {
            // Find a complete JSON object
            const endPos = dataBuffer.indexOf('\n', startPos);
            if (endPos === -1) {
                // No newline found, wait for more data
                break;
            }

            const jsonStr = dataBuffer.substring(startPos, endPos).trim();
            if (!jsonStr) {
                // Empty line, skip
                startPos = endPos + 1;
                continue;
            }

            // Parse as JSON
            const jsonData = JSON.parse(jsonStr) as BrowserTabData;
            processedIndex = endPos + 1;

            // Send data to renderer process
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('browser-monitor-data', jsonData);

                // Check if this is an active tab with a URL that should be analyzed
                if (jsonData.active && jsonData.url && shouldAnalyzeUrl(jsonData.url)) {
                    // Only analyze active tabs for phishing
                    void analyzeUrlForPhishing(jsonData.url);
                }
            }

            startPos = endPos + 1;
        } catch (error) {
            // If JSON parsing fails, try the next line
            const nextNewline = dataBuffer.indexOf('\n', startPos + 1);
            if (nextNewline === -1) {
                // No more newlines, wait for more data
                break;
            }
            startPos = nextNewline + 1;
            console.error('Error parsing browser monitor data:', error);
        }
    }

    // Remove processed data from buffer
    if (processedIndex > 0) {
        dataBuffer = dataBuffer.substring(processedIndex);
    }
};

/**
 * Start browser monitoring
 * @returns Operation result
 */
const startMonitoring = async (): Promise<{ success: boolean; message: string }> => {
    if (isMonitoring) {
        return { success: true, message: 'Browser monitoring is already running' };
    }

    try {
        // Get the monitor program path and args
        const { execPath, args } = getMonitorExecutablePath();

        // If we're not using Python fallback and on non-Windows, ensure file is executable
        if (!execPath.includes('python') && process.platform !== 'win32') {
            await makeExecutable(execPath);
        }

        // Set environment variables and options
        const options: SpawnOptions = {
            env: { ...process.env, PYTHONUNBUFFERED: '1' },
            stdio: ['pipe', 'pipe', 'pipe']
        };

        // Start the monitoring process
        monitorProcess = spawn(execPath, args, options);

        // Reset data buffer
        dataBuffer = '';

        // Clear analyzed URLs
        analyzedUrls.clear();

        // Set up data reception
        monitorProcess.stdout?.on('data', processMonitorData);

        // Error handling
        monitorProcess.stderr?.on('data', (data) => {
            console.error('Browser monitor error:', data.toString());
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('browser-monitor-data', {
                    error: true,
                    message: data.toString()
                });
            }
        });

        // Process error handling
        monitorProcess.on('error', (error) => {
            console.error(`Process start error: ${error.message}`);
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('browser-monitor-data', {
                    error: true,
                    message: `Failed to start monitor: ${error.message}`
                });
            }
        });

        // Listen for process exit
        monitorProcess.on('close', (code) => {
            console.log(`Browser monitor process exited with code: ${code}`);
            isMonitoring = false;
            monitorProcess = null;

            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('browser-monitor-data', {
                    status: 'stopped',
                    code
                });
            }
        });

        isMonitoring = true;
        return { success: true, message: 'Browser monitoring started successfully' };
    } catch (error) {
        console.error('Failed to start browser monitoring:', error);
        return {
            success: false,
            message: `Failed to start browser monitoring: ${error instanceof Error ? error.message : String(error)}`
        };
    }
};

/**
 * Stop browser monitoring
 * @returns Operation result
 */
const stopMonitoring = async (): Promise<{ success: boolean; message: string }> => {
    if (!isMonitoring || !monitorProcess) {
        return { success: true, message: 'Browser monitoring is not running' };
    }

    try {
        // On Windows, use taskkill to ensure child processes are terminated
        if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', String(monitorProcess.pid), '/f', '/t']);
        } else {
            // On macOS/Linux, use kill signal
            monitorProcess.kill('SIGTERM');

            // If the process hasn't exited after a period, force kill it
            setTimeout(() => {
                if (monitorProcess && !monitorProcess.killed) {
                    monitorProcess.kill('SIGKILL');
                }
            }, 2000);
        }

        isMonitoring = false;
        return { success: true, message: 'Browser monitoring stopped' };
    } catch (error) {
        console.error('Failed to stop browser monitoring:', error);
        return {
            success: false,
            message: `Failed to stop browser monitoring: ${error instanceof Error ? error.message : String(error)}`
        };
    }
};

/**
 * Get monitoring status
 * @returns Current monitoring status
 */
const getStatus = (): { isRunning: boolean } => {
    return { isRunning: isMonitoring };
};

// Export service object with all functions
export const browserMonitorService = {
    setMainWindow,
    startMonitoring,
    stopMonitoring,
    getStatus
}; 