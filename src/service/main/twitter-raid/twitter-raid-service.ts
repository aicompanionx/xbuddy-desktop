import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { getMainWindow } from '../window';

// Define auto reply options interface
export interface AutoReplyOptions {
    url?: string;
    comment?: string;
    urls?: string;
    comments?: string;
    repeat?: string | number;
    lang?: string | 'zh' | 'en';
    fast?: boolean;
    debug?: boolean;
    [key: string]: string | number | boolean | undefined;
}

// Define response interface
export interface AutoReplyResponse {
    success: boolean;
    message: string;
    processId?: number;
    targetCount?: number;
    commentCount?: number;
    completed?: boolean;
    exitCode?: number | null;
}

// Store running processes
const runningProcesses: Map<number, {
    process: ChildProcess;
    startTime: Date;
    options: AutoReplyOptions;
    resolver?: (value: AutoReplyResponse) => void;
}> = new Map();

let pid: number

/**
 * Auto Reply Service
 */
export const autoReplyService = {
    /**
     * Execute auto reply operation asynchronously
     * @param options Auto reply options
     * @returns Promise with process result
     */
    executeAutoReply: (options: AutoReplyOptions): Promise<AutoReplyResponse> => {
        return new Promise((resolve) => {
            try {
                // Basic configuration
                const config = {
                    language: options.lang,
                    fastMode: false,
                    debug: false
                };

                const isEN = config.language === 'en';

                // Parse options to get counts
                const targetUrls = options.urls ? options.urls.split(',').filter(u => u.trim().length > 0) : [];
                const comments = options.comments ? options.comments.split(',').filter(c => c.trim().length > 0) : [];

                // Track what we're processing
                const targetCount = targetUrls.length || (options.url ? 1 : 0);
                const commentCount = comments.length || (options.comment ? 1 : 0);

                // Validate required parameters
                if (targetCount === 0) {
                    resolve({
                        success: false,
                        message: isEN ? 'No target URLs specified' : '未指定目标URL',
                        targetCount: 0,
                        commentCount,
                        completed: true
                    });
                    return;
                }

                if (commentCount === 0) {
                    resolve({
                        success: false,
                        message: isEN ? 'No comments specified' : '未指定评论内容',
                        targetCount,
                        commentCount: 0,
                        completed: true
                    });
                    return;
                }

                // Get executable path (this has been updated to use service/bin)
                const executablePath = getExecutablePath();
                if (!executablePath) {
                    resolve({
                        success: false,
                        message: isEN
                            ? 'Error: Executable not found, please build the project first'
                            : '错误：可执行文件未找到，请先构建项目',
                        completed: true
                    });
                    return;
                }

                // Set executable permissions if needed (for macOS and Linux)
                if (process.platform !== 'win32' && executablePath !== 'python' && executablePath !== 'python3') {
                    try {
                        fs.chmodSync(executablePath, '755');
                        console.log(isEN ? 'Executable permission set' : '已为可执行文件设置执行权限');
                    } catch (error) {
                        console.error(
                            isEN
                                ? `设置执行权限失败: ${error instanceof Error ? error.message : String(error)}`
                                : `Failed to set permissions: ${error instanceof Error ? error.message : String(error)}`
                        );
                    }
                }

                // Build command line arguments
                const cmdArgs = buildCommandArgs(options);

                // Set environment variables
                const env = {
                    ...process.env,
                    PYTHONUNBUFFERED: '1', // Ensure Python output is not buffered
                    LANG: isEN ? 'en_US.UTF-8' : 'zh_CN.UTF-8',
                };

                console.log(isEN ? `Starting auto reply...` : `正在启动自动回复...`);
                console.log('[AutoReply] Using executable:', executablePath);
                console.log('[AutoReply] Arguments:', cmdArgs.join(' '));
                console.log(`[AutoReply] Processing ${targetCount} URL(s) with ${commentCount} comment(s)`);

                // Execute program
                const childProcess = spawn(executablePath, cmdArgs, {
                    env,
                    stdio: ['pipe', 'pipe', 'pipe'] // 使用pipe而不是inherit
                });

                // Record start time
                const startTime = new Date();
                console.log(
                    isEN
                        ? `Start Time: ${startTime.toLocaleString()}`
                        : `启动时间: ${startTime.toLocaleString()}`
                );

                // Save process reference and metadata
                const processId = childProcess.pid || Date.now();

                pid = processId

                runningProcesses.set(processId, {
                    process: childProcess,
                    startTime,
                    options,
                    resolver: resolve
                });

                // Set up process listeners
                setupProcessListeners(childProcess, config.language);

                // Return initial status (process started, but not completed)
                // Final resolution will happen in the 'close' event handler
                const initialResponse: AutoReplyResponse = {
                    success: true,
                    message: isEN
                        ? `Auto reply process started (PID: ${processId})`
                        : `自动回复进程已启动 (PID: ${processId})`,
                    processId,
                    targetCount,
                    commentCount,
                    completed: false
                };

                // Notify caller that process has started
                // The promise will be resolved later when the process completes
                resolve(initialResponse);
            } catch (error) {
                console.error('[AutoReply] Error starting process:', error);
                const isEN = options.lang || (process.env.LANG?.includes('zh') ? 'zh' : 'en');
                resolve({
                    success: false,
                    message: isEN
                        ? `Failed to start auto reply process: ${error instanceof Error ? error.message : String(error)}`
                        : `启动自动回复进程失败: ${error instanceof Error ? error.message : String(error)}`,
                    completed: true
                });
            }
        });
    },

    /**
     * Wait for auto reply process to complete
     * @param processId Process ID
     * @returns Promise that resolves when the process completes
     */
    waitForCompletion: (processId: number): Promise<AutoReplyResponse> => {
        return new Promise((resolve) => {
            const processInfo = runningProcesses.get(processId);

            if (!processInfo) {
                resolve({
                    success: false,
                    message: 'Process not found or already completed',
                    completed: true
                });
                return;
            }

            // If process is already completed, resolve immediately
            if (processInfo.process.exitCode !== null) {
                resolve({
                    success: processInfo.process.exitCode === 0,
                    message: `Process completed with exit code: ${processInfo.process.exitCode}`,
                    processId,
                    completed: true,
                    exitCode: processInfo.process.exitCode
                });
                return;
            }

            // Otherwise, replace the resolver to notify when the process completes
            processInfo.resolver = resolve;
        });
    },

    /**
     * Stop specific auto reply process
     * @param processId Process ID
     * @returns Process result
     */
    stopAutoReply: (): AutoReplyResponse => {
        const processInfo = runningProcesses.get(pid);

        if (!processInfo) {
            return {
                success: false,
                message: 'Process not found',
                completed: true
            };
        }

        try {
            const lang = processInfo.options.lang
            const isEN = lang === 'en';

            if (!processInfo.process.killed) {
                // Send SIGINT to allow graceful shutdown
                processInfo.process.kill('SIGINT');

                // Record end time and calculate duration
                recordEndTime(processInfo.startTime, lang);

                // If there's a resolver waiting for completion, notify it
                if (processInfo.resolver) {
                    processInfo.resolver({
                        success: false,
                        message: isEN
                            ? `Process manually stopped (PID: ${pid})`
                            : `进程已手动停止 (PID: ${pid})`,
                        processId: pid,
                        completed: true,
                        exitCode: -1 // Use -1 to indicate manual termination
                    });
                }

                runningProcesses.delete(pid);
                return {
                    success: true,
                    message: isEN
                        ? `Stopped process (PID: ${pid})`
                        : `已停止进程 (PID: ${pid})`,
                    completed: true
                };
            } else {
                runningProcesses.delete(pid);
                return {
                    success: true,
                    message: isEN
                        ? `Process already terminated (PID: ${pid})`
                        : `进程已经终止 (PID: ${pid})`,
                    completed: true
                };
            }
        } catch (error) {
            console.error(`[AutoReply] Error stopping process ${pid}:`, error);
            return {
                success: false,
                message: `Failed to stop process: ${error instanceof Error ? error.message : String(error)}`,
                completed: true
            };
        }
    },

    /**
     * Stop all auto reply processes
     * @returns Process result
     */
    stopAllAutoReplies: (): AutoReplyResponse => {
        let stopCount = 0;
        let failCount = 0;

        runningProcesses.forEach((processInfo, id) => {
            try {
                if (!processInfo.process.killed) {
                    processInfo.process.kill('SIGINT');
                    stopCount++;

                    // Record end time for each process
                    const lang = processInfo.options.lang
                    const isEN = lang === 'en';
                    recordEndTime(processInfo.startTime, lang);

                    // If there's a resolver waiting for completion, notify it
                    if (processInfo.resolver) {
                        processInfo.resolver({
                            success: false,
                            message: isEN
                                ? `Process manually stopped (PID: ${id})`
                                : `进程已手动停止 (PID: ${id})`,
                            processId: id,
                            completed: true,
                            exitCode: -1 // Use -1 to indicate manual termination
                        });
                    }
                }
                runningProcesses.delete(id);
            } catch (error) {
                console.error(`[AutoReply] Error stopping process ${id}:`, error);
                failCount++;
            }
        });

        const lang = process.env.LANG || 'en';
        const isEN = lang === 'en';
        return {
            success: true,
            message: isEN
                ? `Stopped ${stopCount} process(es)${failCount > 0 ? `, ${failCount} process(es) failed to stop` : ''}`
                : `已停止 ${stopCount} 个进程${failCount > 0 ? `，${failCount} 个进程停止失败` : ''}`,
            completed: true
        };
    },

    /**
     * Get status of running auto reply processes
     * @returns Status information
     */
    getStatus: (): { runningCount: number, processes: number[] } => {
        console.log("runningProcesses", runningProcesses);
        return {
            runningCount: runningProcesses.size,
            processes: Array.from(runningProcesses.keys())
        };
    },

    /**
     * Login continue
     * @returns Promise with login result
     */
    loginContinue: (): Promise<AutoReplyResponse> => {
        return new Promise((resolve) => {
            // Send SIGINT to allow graceful shutdown
            const processInfo = runningProcesses.get(pid);

            if (!processInfo) {
                resolve({
                    success: false,
                    message: 'Process not found',
                    completed: true
                });
                return;
            }

            processInfo.process.stdin.write('y\n');

            resolve({
                success: true,
                message: 'Login continue',
                completed: true
            });
        });
    }
};
/**
 * Get executable path
 * @returns Path to the executable or undefined if not found
 */
function getExecutablePath(): string | undefined {
    const isWindows = process.platform === 'win32';

    const executablePath = isWindows
        ? path.join(app.getAppPath(), 'src', 'service', 'bin', 'x_auto_reply.exe')
        : path.join(app.getAppPath(), 'src', 'service', 'bin', 'run_x_auto_reply.sh');

    console.log("executablePath", executablePath);


    try {
        if (fs.existsSync(executablePath)) {
            return executablePath;
        }
    } catch (err) {
        console.error(`[AutoReply] Error checking executable path ${executablePath}:`, err);
    }

    return undefined;
}

/**
 * Build command line arguments
 * @param options Auto reply options
 * @returns Array of command line arguments
 */
function buildCommandArgs(options: AutoReplyOptions): string[] {
    const cmdArgs: string[] = [];
    const config = {
        language: options.lang || 'en',
        fastMode: false,
        debug: false
    };

    const isEN = config.language === 'en';

    // Add language parameter
    cmdArgs.push(`--lang=${config.language}`);

    // Add fast mode parameter if enabled
    if (config.fastMode) {
        cmdArgs.push('--fast');
        console.log(isEN ? 'Fast mode enabled' : '启用快速模式');
    }

    // Add debug mode parameter if enabled
    if (config.debug) {
        cmdArgs.push('--debug');
        console.log(isEN ? 'Debug mode enabled' : '启用调试模式');
    }

    // Add URL parameter
    if (options.url) {
        cmdArgs.push('--url', options.url);
    }

    // Add comment parameter
    if (options.comment) {
        cmdArgs.push('--comment', options.comment);
    }

    // Add multiple URLs parameter
    if (options.urls) {
        const urlList = options.urls.split(',').map(url => url.trim()).filter(url => url.length > 0);
        urlList.forEach((url: string) => {
            cmdArgs.push('--url', url); // Note: using --url for each URL
        });
    }

    // Add multiple comments parameter
    if (options.comments) {
        const commentList = options.comments.split(',').map(comment => comment.trim()).filter(comment => comment.length > 0);
        commentList.forEach((comment: string) => {
            cmdArgs.push('--comment', comment); // Note: using --comment for each comment
        });
    }

    // Add repeat count parameter
    if (options.repeat) {
        cmdArgs.push('--repeat', String(options.repeat));
    }

    return cmdArgs;
}

/**
 * Set up process listeners
 * @param childProcess Child process instance
 * @param language Language setting for messages
 */
function setupProcessListeners(childProcess: ChildProcess, language: string): void {
    const isEN = language === 'en';

    // Handle standard output
    childProcess.stdout?.on('data', (data: Buffer) => {
        // Log to console
        process.stdout.write(data);

        try {
            // Send to renderer process
            const mainWindow = getMainWindow();
            if (mainWindow) {
                const dataString = data.toString().trim();
                console.log("dataString----", dataString);
                try {

                    if (dataString.startsWith('{')) {
                        const message = JSON.parse(dataString);
                        console.log("Sending stdout to renderer:", message);

                        mainWindow.webContents.send('on-raid-status', {
                            success: true,
                            message: message,
                            processId: childProcess.pid || 0
                        });

                        return;
                    }

                } catch (error) {
                    console.error('Error sending stdout to renderer:', error);
                }

                // Check for login prompts
                const isLogin = dataString.includes(isEN ? 'Please login first' : '请先登录')

                if (isLogin) {
                    mainWindow.webContents.send('on-login-need', {
                        success: true,
                        message: 'login-required',
                        processId: childProcess.pid || 0
                    });
                }
            }
        } catch (error) {
            console.error('Error sending stdout to renderer:', error);
        }
    });

    // Handle error output
    childProcess.stderr?.on('data', (data: Buffer) => {
        try {
            // Log errors to console
            process.stderr.write(data);

            // Send errors to renderer process
            const mainWindow = getMainWindow();
            if (mainWindow) {
                const errorMessage = data.toString().trim();
                console.log("Sending stderr to renderer:", errorMessage);

                mainWindow.webContents.send('on-raid-status', {
                    success: false,
                    message: errorMessage,
                    processId: childProcess.pid || 0
                });
            }
        } catch (error) {
            console.error('Error sending stderr to renderer:', error);
        }
    });

    // Process end
    childProcess.on('close', (code: number | null) => {
        console.log(
            isEN
                ? `Process exited with code: ${code !== null ? code : 'unknown'}`
                : `进程已退出，退出码: ${code !== null ? code : '未知'}`
        );

        // Remove from running processes list
        if (childProcess.pid) {
            const processInfo = runningProcesses.get(childProcess.pid);
            if (processInfo) {
                recordEndTime(processInfo.startTime, language);

                // If there's a resolver waiting for completion, notify it
                if (processInfo.resolver) {
                    processInfo.resolver({
                        success: code === 0,
                        message: isEN
                            ? `Process completed with exit code: ${code !== null ? code : 'unknown'}`
                            : `进程已完成，退出码: ${code !== null ? code : '未知'}`,
                        processId: childProcess.pid,
                        completed: true,
                        exitCode: code
                    });
                }

                runningProcesses.delete(childProcess.pid);
            }
        }
    });

    // Handle process error
    childProcess.on('error', (err: Error) => {
        console.error(
            isEN
                ? `Failed to start: ${err.message}`
                : `启动失败: ${err.message}`
        );

        // Remove from running processes list
        if (childProcess.pid) {
            const processInfo = runningProcesses.get(childProcess.pid);

            // If there's a resolver waiting for completion, notify it
            if (processInfo?.resolver) {
                processInfo.resolver({
                    success: false,
                    message: isEN
                        ? `Process error: ${err.message}`
                        : `进程出错: ${err.message}`,
                    processId: childProcess.pid,
                    completed: true,
                    exitCode: 1 // Use 1 to indicate error
                });
            }

            runningProcesses.delete(childProcess.pid);
        }
    });
}

/**
 * Record end time and calculate duration
 * @param startTime Process start time
 * @param language Language setting for messages
 */
function recordEndTime(startTime: Date, language: string): void {
    const isEN = language === 'en';
    const endTime = new Date();
    const runTime = (endTime.getTime() - startTime.getTime()) / 1000; // Convert to seconds

    console.log(
        isEN
            ? `结束时间: ${endTime.toLocaleString()}`
            : `End Time: ${endTime.toLocaleString()}`
    );

    console.log(
        isEN
            ? `总运行时间: ${runTime.toFixed(2)}秒`
            : `Total execution time: ${runTime.toFixed(2)} seconds`
    );
}

// Clean up all processes when app is closing
app.on('before-quit', () => {
    autoReplyService.stopAllAutoReplies();
});