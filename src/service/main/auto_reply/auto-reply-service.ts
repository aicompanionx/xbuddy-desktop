// import { spawn, ChildProcess } from 'child_process';
// import path from 'path';
// import fs from 'fs';
// import { app } from 'electron';

// // Define auto reply options interface
// export interface AutoReplyOptions {
//     url?: string;
//     comment?: string;
//     urls?: string;
//     comments?: string;
//     repeat?: string | number;
//     lang?: string | 'zh' | 'en';
//     fast?: boolean;
//     debug?: boolean;
//     [key: string]: string | number | boolean | undefined;
// }

// // Define response interface
// export interface AutoReplyResponse {
//     success: boolean;
//     message: string;
//     processId?: number;
//     targetCount?: number;
//     commentCount?: number;
// }

// // Store running processes
// const runningProcesses: Map<number, {
//     process: ChildProcess;
//     startTime: Date;
//     options: AutoReplyOptions;
// }> = new Map();

// /**
//  * Auto Reply Service
//  */
// export const autoReplyService = {
//     /**
//      * Execute auto reply operation
//      * @param options Auto reply options
//      * @returns Process result
//      */
//     executeAutoReply: (options: AutoReplyOptions): AutoReplyResponse => {
//         try {
//             // Basic configuration
//             const config = {
//                 language: options.lang || (process.env.LANG?.includes('zh') ? 'zh' : 'en'),
//                 fastMode: options.fast || false,
//                 debug: options.debug || false
//             };

//             // Parse options to get counts
//             const targetUrls = options.urls ? options.urls.split(',').filter(u => u.trim().length > 0) : [];
//             const comments = options.comments ? options.comments.split(',').filter(c => c.trim().length > 0) : [];

//             // Track what we're processing
//             const targetCount = targetUrls.length || (options.url ? 1 : 0);
//             const commentCount = comments.length || (options.comment ? 1 : 0);

//             // Validate required parameters
//             if (targetCount === 0) {
//                 return {
//                     success: false,
//                     message: config.language === 'zh' ? '未指定目标URL' : 'No target URLs specified',
//                     targetCount: 0,
//                     commentCount
//                 };
//             }

//             if (commentCount === 0) {
//                 return {
//                     success: false,
//                     message: config.language === 'zh' ? '未指定评论内容' : 'No comments specified',
//                     targetCount,
//                     commentCount: 0
//                 };
//             }

//             // Get executable path (this has been updated to use service/bin)
//             const executablePath = getExecutablePath();
//             if (!executablePath) {
//                 return {
//                     success: false,
//                     message: config.language === 'zh'
//                         ? '错误：可执行文件未找到，请先构建项目'
//                         : 'Error: Executable not found, please build the project first'
//                 };
//             }

//             // Set executable permissions if needed (for macOS and Linux)
//             if (process.platform !== 'win32' && executablePath !== 'python' && executablePath !== 'python3') {
//                 try {
//                     fs.chmodSync(executablePath, '755');
//                     console.log(config.language === 'zh' ? '已为可执行文件设置执行权限' : 'Executable permission set');
//                 } catch (error) {
//                     console.error(
//                         config.language === 'zh'
//                             ? `设置执行权限失败: ${error instanceof Error ? error.message : String(error)}`
//                             : `Failed to set permissions: ${error instanceof Error ? error.message : String(error)}`
//                     );
//                 }
//             }

//             // Build command line arguments
//             const cmdArgs = buildCommandArgs(options);

//             // Set environment variables
//             const env = {
//                 ...process.env,
//                 PYTHONUNBUFFERED: '1', // Ensure Python output is not buffered
//                 LANG: config.language === 'zh' ? 'zh_CN.UTF-8' : 'en_US.UTF-8',
//             };

//             console.log(config.language === 'zh' ? `正在启动自动回复...` : `Starting auto reply...`);
//             console.log('[AutoReply] Using executable:', executablePath);
//             console.log('[AutoReply] Arguments:', cmdArgs.join(' '));
//             console.log(`[AutoReply] Processing ${targetCount} URL(s) with ${commentCount} comment(s)`);

//             // Execute program
//             const childProcess = spawn(executablePath, cmdArgs, {
//                 env,
//                 stdio: ['inherit', 'pipe', 'pipe'] // inherit stdin, pipe stdout and stderr
//             });

//             // Record start time
//             const startTime = new Date();
//             console.log(
//                 config.language === 'zh'
//                     ? `启动时间: ${startTime.toLocaleString()}`
//                     : `Start Time: ${startTime.toLocaleString()}`
//             );

//             // Save process reference and metadata
//             const processId = childProcess.pid || Date.now();
//             runningProcesses.set(processId, {
//                 process: childProcess,
//                 startTime,
//                 options
//             });

//             // Set up process listeners
//             setupProcessListeners(childProcess, config.language);

//             return {
//                 success: true,
//                 message: config.language === 'zh'
//                     ? `自动回复进程已启动 (PID: ${processId})`
//                     : `Auto reply process started (PID: ${processId})`,
//                 processId,
//                 targetCount,
//                 commentCount
//             };
//         } catch (error) {
//             console.error('[AutoReply] Error starting process:', error);
//             const errorLang = options.lang || (process.env.LANG?.includes('zh') ? 'zh' : 'en');
//             return {
//                 success: false,
//                 message: errorLang === 'zh'
//                     ? `启动自动回复进程失败: ${error instanceof Error ? error.message : String(error)}`
//                     : `Failed to start auto reply process: ${error instanceof Error ? error.message : String(error)}`
//             };
//         }
//     },

//     /**
//      * Stop specific auto reply process
//      * @param processId Process ID
//      * @returns Process result
//      */
//     stopAutoReply: (processId: number): AutoReplyResponse => {
//         const processInfo = runningProcesses.get(processId);

//         if (!processInfo) {
//             return {
//                 success: false,
//                 message: 'Process not found'
//             };
//         }

//         try {
//             const lang = processInfo.options.lang || (process.env.LANG?.includes('zh') ? 'zh' : 'en');

//             if (!processInfo.process.killed) {
//                 // Send SIGINT to allow graceful shutdown
//                 processInfo.process.kill('SIGINT');

//                 // Record end time and calculate duration
//                 recordEndTime(processInfo.startTime, lang);

//                 runningProcesses.delete(processId);
//                 return {
//                     success: true,
//                     message: lang === 'zh'
//                         ? `已停止进程 (PID: ${processId})`
//                         : `Stopped process (PID: ${processId})`
//                 };
//             } else {
//                 runningProcesses.delete(processId);
//                 return {
//                     success: true,
//                     message: lang === 'zh'
//                         ? `进程已经终止 (PID: ${processId})`
//                         : `Process already terminated (PID: ${processId})`
//                 };
//             }
//         } catch (error) {
//             console.error(`[AutoReply] Error stopping process ${processId}:`, error);
//             return {
//                 success: false,
//                 message: `Failed to stop process: ${error instanceof Error ? error.message : String(error)}`
//             };
//         }
//     },

//     /**
//      * Stop all auto reply processes
//      * @returns Process result
//      */
//     stopAllAutoReplies: (): AutoReplyResponse => {
//         let stopCount = 0;
//         let failCount = 0;

//         runningProcesses.forEach((processInfo, id) => {
//             try {
//                 if (!processInfo.process.killed) {
//                     processInfo.process.kill('SIGINT');
//                     stopCount++;

//                     // Record end time for each process
//                     const lang = processInfo.options.lang || (process.env.LANG?.includes('zh') ? 'zh' : 'en');
//                     recordEndTime(processInfo.startTime, lang);
//                 }
//                 runningProcesses.delete(id);
//             } catch (error) {
//                 console.error(`[AutoReply] Error stopping process ${id}:`, error);
//                 failCount++;
//             }
//         });

//         const lang = process.env.LANG?.includes('zh') ? 'zh' : 'en';
//         return {
//             success: true,
//             message: lang === 'zh'
//                 ? `已停止 ${stopCount} 个进程${failCount > 0 ? `，${failCount} 个进程停止失败` : ''}`
//                 : `Stopped ${stopCount} process(es)${failCount > 0 ? `, ${failCount} process(es) failed to stop` : ''}`
//         };
//     },

//     /**
//      * Get status of running auto reply processes
//      * @returns Status information
//      */
//     getStatus: (): { runningCount: number, processes: number[] } => {
//         return {
//             runningCount: runningProcesses.size,
//             processes: Array.from(runningProcesses.keys())
//         };
//     }
// };

// /**
//  * Get executable path
//  * @returns Path to the executable or undefined if not found
//  */
// function getExecutablePath(): string | undefined {
//     // Check different possible paths
//     const possiblePaths = [
//         // Paths relative to current directory
//         path.join(app.getAppPath(), 'service', 'bin', 'x_auto_reply', 'x_auto_reply'),
//         path.join(app.getAppPath(), 'service', 'bin', 'x_auto_reply', 'x_auto_reply.exe'),
//         // Direct Python usage
//         'python',
//         'python3'
//     ];

//     for (const exePath of possiblePaths) {
//         if (exePath === 'python' || exePath === 'python3') return exePath;

//         try {
//             if (fs.existsSync(exePath)) {
//                 return exePath;
//             }
//         } catch (err) {
//             // Ignore errors, continue trying other paths
//         }
//     }

//     // Return undefined if no executable found
//     return undefined;
// }

// /**
//  * Build command line arguments
//  * @param options Auto reply options
//  * @returns Array of command line arguments
//  */
// function buildCommandArgs(options: AutoReplyOptions): string[] {
//     const cmdArgs: string[] = [];
//     const config = {
//         language: options.lang || (process.env.LANG?.includes('zh') ? 'zh' : 'en'),
//         fastMode: options.fast || false,
//         debug: options.debug || false
//     };

//     // If using Python instead of packaged executable, add script path
//     const executablePath = getExecutablePath();
//     if (executablePath === 'python' || executablePath === 'python3') {
//         cmdArgs.push('index.py');
//     }

//     // Add language parameter
//     cmdArgs.push(`--lang=${config.language}`);

//     // Add fast mode parameter if enabled
//     if (config.fastMode) {
//         cmdArgs.push('--fast');
//         console.log(config.language === 'zh' ? '启用快速模式' : 'Fast mode enabled');
//     }

//     // Add debug mode parameter if enabled
//     if (config.debug) {
//         cmdArgs.push('--debug');
//         console.log(config.language === 'zh' ? '启用调试模式' : 'Debug mode enabled');
//     }

//     // Add URL parameter
//     if (options.url) {
//         cmdArgs.push('--url', options.url);
//     }

//     // Add comment parameter
//     if (options.comment) {
//         cmdArgs.push('--comment', options.comment);
//     }

//     // Add multiple URLs parameter
//     if (options.urls) {
//         const urlList = options.urls.split(',').map(url => url.trim()).filter(url => url.length > 0);
//         urlList.forEach((url: string) => {
//             cmdArgs.push('--url', url); // Note: using --url for each URL
//         });
//     }

//     // Add multiple comments parameter
//     if (options.comments) {
//         const commentList = options.comments.split(',').map(comment => comment.trim()).filter(comment => comment.length > 0);
//         commentList.forEach((comment: string) => {
//             cmdArgs.push('--comment', comment); // Note: using --comment for each comment
//         });
//     }

//     // Add repeat count parameter
//     if (options.repeat) {
//         cmdArgs.push('--repeat', String(options.repeat));
//     }

//     return cmdArgs;
// }

// /**
//  * Set up process listeners
//  * @param childProcess Child process instance
//  * @param language Language setting for messages
//  */
// function setupProcessListeners(childProcess: ChildProcess, language: string): void {
//     // Handle output
//     childProcess.stdout?.on('data', (data: Buffer) => {
//         // Output directly to console
//         process.stdout.write(data);
//     });

//     // Handle errors
//     childProcess.stderr?.on('data', (data: Buffer) => {
//         // Output errors directly to console
//         process.stderr.write(data);
//     });

//     // Process end
//     childProcess.on('close', (code: number | null) => {
//         console.log(
//             language === 'zh'
//                 ? `进程已退出，退出码: ${code !== null ? code : '未知'}`
//                 : `Process exited with code: ${code !== null ? code : 'unknown'}`
//         );

//         // Remove from running processes list
//         if (childProcess.pid) {
//             const processInfo = runningProcesses.get(childProcess.pid);
//             if (processInfo) {
//                 recordEndTime(processInfo.startTime, language);
//                 runningProcesses.delete(childProcess.pid);
//             }
//         }
//     });

//     // Handle process error
//     childProcess.on('error', (err: Error) => {
//         console.error(
//             language === 'zh'
//                 ? `启动失败: ${err.message}`
//                 : `Failed to start: ${err.message}`
//         );

//         // Remove from running processes list
//         if (childProcess.pid) {
//             runningProcesses.delete(childProcess.pid);
//         }
//     });
// }

// /**
//  * Record end time and calculate duration
//  * @param startTime Process start time
//  * @param language Language setting for messages
//  */
// function recordEndTime(startTime: Date, language: string): void {
//     const endTime = new Date();
//     const runTime = (endTime.getTime() - startTime.getTime()) / 1000; // Convert to seconds

//     console.log(
//         language === 'zh'
//             ? `结束时间: ${endTime.toLocaleString()}`
//             : `End Time: ${endTime.toLocaleString()}`
//     );

//     console.log(
//         language === 'zh'
//             ? `总运行时间: ${runTime.toFixed(2)}秒`
//             : `Total execution time: ${runTime.toFixed(2)} seconds`
//     );
// }

// // Clean up all processes when app is closing
// app.on('before-quit', () => {
//     autoReplyService.stopAllAutoReplies();
// }); 