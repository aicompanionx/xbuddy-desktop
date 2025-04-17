import { BrowserWindow, ipcMain, app } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Define browser data interface
interface BrowserData {
    url?: string;
    process?: string;
    active?: boolean;
    time?: string;
    title?: string;
    status?: string;
    message?: string;
    error?: string;
    [key: string]: any;
}

let monitorProcess: ReturnType<typeof spawn> | null = null;
let buffer = '';

/**
 * Start browser monitoring
 */
export const startBrowserMonitoring = () => {
    if (monitorProcess) {
        return { success: false, message: 'Browser monitoring is already running' };
    }

    try {
        // Get application root path
        const appRoot = app.getAppPath();

        // Determine executable path
        const platform = os.platform();
        let executablePath;
        const args: string[] = [];

        if (platform === 'win32') {
            executablePath = path.join(appRoot, 'src', 'lib', 'bin', 'browser_monitor.exe');

            // Fallback for development mode
            if (!fs.existsSync(executablePath)) {
                executablePath = 'python';
                args.push(path.join(appRoot, 'src', 'lib', 'bin', 'browser_monitor.py'));
            }
        } else if (platform === 'darwin') {
            executablePath = path.join(appRoot, 'src', 'lib', 'bin', 'browser_monitor');

            // Fallback for development mode
            if (!fs.existsSync(executablePath)) {
                executablePath = 'python3';
                const pyScriptPath = path.join(appRoot, 'src', 'lib', 'bin', 'browser_monitor.py');

                if (!fs.existsSync(pyScriptPath)) {
                    // Try direct executable without path prefix
                    const directExecutable = path.join('src', 'lib', 'bin', 'browser_monitor');

                    if (fs.existsSync(directExecutable)) {
                        executablePath = directExecutable;
                        args.length = 0;
                    } else {
                        // Last resort - try the binary in the current directory
                        executablePath = './src/lib/bin/browser_monitor';

                        if (!fs.existsSync(executablePath)) {
                            // List directory content to help debug
                            try {
                                const binDir = path.join(appRoot, 'src', 'lib', 'bin');
                                const files = fs.readdirSync(binDir);
                                console.error(`浏览器监控可执行文件未找到，可用文件: ${files.join(', ')}`);
                            } catch (e) {
                                console.error(`无法列出bin目录: ${e}`);
                            }

                            throw new Error(`浏览器监控可执行文件未找到`);
                        }
                    }
                } else {
                    args.push(pyScriptPath);
                }
            }
        } else {
            throw new Error(`不支持的操作系统: ${platform}`);
        }

        // Environment variables and options
        const options = {
            env: { ...process.env, PYTHONUNBUFFERED: '1' },
            stdio: 'pipe' as const,
        };

        // Launch executable as child process
        monitorProcess = spawn(executablePath, args, options);
        buffer = '';

        // Process output data
        monitorProcess.stdout.on('data', (data) => {
            const rawOutput = data.toString();
            buffer += rawOutput;

            // Try to extract complete JSON objects from buffer
            let processedIndex = 0;
            let startPos = 0;

            while (startPos < buffer.length) {
                try {
                    // Try to find a complete JSON object
                    const endPos = buffer.indexOf('\n', startPos);
                    if (endPos === -1) {
                        // No newline found, wait for more data
                        break;
                    }

                    const jsonStr = buffer.substring(startPos, endPos).trim();
                    if (!jsonStr) {
                        // Empty line, skip
                        startPos = endPos + 1;
                        continue;
                    }

                    // Try to parse as JSON
                    const data = JSON.parse(jsonStr) as BrowserData;
                    processedIndex = endPos + 1;

                    // Broadcast data to all windows
                    BrowserWindow.getAllWindows().forEach(window => {
                        if (!window.isDestroyed()) {
                            window.webContents.send('browser-monitor-data', data);
                        }
                    });

                    // 只记录错误信息
                    if (data.error) {
                        console.error(`浏览器监控错误: ${data.error}`);
                    }

                    startPos = endPos + 1;
                } catch (e) {
                    // If JSON parsing fails, try the next line
                    const nextNewline = buffer.indexOf('\n', startPos + 1);
                    if (nextNewline === -1) {
                        // No more newlines, wait for more data
                        break;
                    }
                    startPos = nextNewline + 1;
                }
            }

            // Remove processed data from buffer
            if (processedIndex > 0) {
                buffer = buffer.substring(processedIndex);
            }
        });

        monitorProcess.stderr.on('data', (data) => {
            console.error(`浏览器监控错误: ${data.toString()}`);
        });

        monitorProcess.on('error', (error) => {
            console.error(`进程启动错误: ${error.message}`);
        });

        monitorProcess.on('close', (code) => {
            if (code !== 0 && code !== null) {
                console.error(`浏览器监控异常退出，退出代码: ${code}`);
            }
            monitorProcess = null;
        });

        return { success: true, message: 'Browser monitoring started' };
    } catch (error) {
        console.error('启动浏览器监控失败:', error);
        return {
            success: false,
            message: `启动浏览器监控失败: ${error instanceof Error ? error.message : String(error)}`
        };
    }
};

/**
 * Stop browser monitoring
 */
export const stopBrowserMonitoring = () => {
    if (!monitorProcess) {
        return { success: false, message: 'Browser monitoring is not running' };
    }

    try {
        monitorProcess.kill();
        monitorProcess = null;
        return { success: true, message: 'Browser monitoring stopped' };
    } catch (error) {
        console.error('停止浏览器监控失败:', error);
        return {
            success: false,
            message: `停止浏览器监控失败: ${error instanceof Error ? error.message : String(error)}`
        };
    }
};

/**
 * Set up browser monitor IPC handlers
 */
export const setupBrowserMonitorHandlers = () => {
    // Start browser monitoring
    ipcMain.handle('start-browser-monitoring', () => {
        return startBrowserMonitoring();
    });

    // Stop browser monitoring
    ipcMain.handle('stop-browser-monitoring', () => {
        return stopBrowserMonitoring();
    });

    // Get browser monitoring status
    ipcMain.handle('get-browser-monitoring-status', () => {
        return { isRunning: monitorProcess !== null };
    });
}; 