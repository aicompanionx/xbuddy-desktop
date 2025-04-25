// import { ipcMain } from 'electron'
// import { autoReplyService, AutoReplyOptions } from './auto-reply-service'
// import { getMainWindow } from '../window'

// /**
//  * Set up auto reply related IPC handlers
//  */
// export function setupAutoReplyIPC(): void {
//     // Handle auto reply execution request
//     ipcMain.on('execute-auto-reply', (_event, options: AutoReplyOptions) => {
//         // Determine language for messages
//         const lang = options.lang || (process.env.LANG?.includes('zh') ? 'zh' : 'en');

//         try {
//             console.log(lang === 'zh' ? '收到自动回复请求:' : 'Received auto reply request:', options);

//             // Validate and process options
//             if (!options) {
//                 throw new Error(lang === 'zh' ? '无效的请求参数' : 'Invalid request parameters');
//             }

//             // Execute auto reply
//             const result = autoReplyService.executeAutoReply(options);
//             console.log(lang === 'zh' ? '自动回复执行结果:' : 'Auto reply execution result:', result);

//             // Notify renderer process about execution result
//             const mainWindow = getMainWindow();
//             if (mainWindow) {
//                 mainWindow.webContents.send('auto-reply-status', result);
//             }
//         } catch (error) {
//             console.error(lang === 'zh' ? '处理自动回复请求时出错:' : 'Error processing auto reply request:', error);

//             // Send error response to renderer
//             const mainWindow = getMainWindow();
//             if (mainWindow) {
//                 mainWindow.webContents.send('auto-reply-status', {
//                     success: false,
//                     message: lang === 'zh'
//                         ? `执行自动回复时出错: ${error instanceof Error ? error.message : String(error)}`
//                         : `Error executing auto reply: ${error instanceof Error ? error.message : String(error)}`
//                 });
//             }
//         }
//     });

//     // Handle stop auto reply request
//     ipcMain.handle('stop-auto-reply', async (_event, { processId }) => {
//         try {
//             if (!processId) {
//                 return {
//                     success: false,
//                     message: 'No process ID provided'
//                 };
//             }

//             return autoReplyService.stopAutoReply(processId);
//         } catch (error) {
//             console.error('Error stopping auto reply process:', error);
//             return {
//                 success: false,
//                 message: `Error stopping process: ${error instanceof Error ? error.message : String(error)}`
//             };
//         }
//     });

//     // Handle stop all auto replies request
//     ipcMain.handle('stop-all-auto-replies', async () => {
//         try {
//             return autoReplyService.stopAllAutoReplies();
//         } catch (error) {
//             console.error('Error stopping all auto reply processes:', error);

//             const lang = process.env.LANG?.includes('zh') ? 'zh' : 'en';
//             return {
//                 success: false,
//                 message: lang === 'zh'
//                     ? `停止所有自动回复进程失败: ${error instanceof Error ? error.message : String(error)}`
//                     : `Failed to stop all auto reply processes: ${error instanceof Error ? error.message : String(error)}`
//             };
//         }
//     });

//     // Handle get auto reply status request
//     ipcMain.handle('get-auto-reply-status', async () => {
//         try {
//             return autoReplyService.getStatus();
//         } catch (error) {
//             console.error('Error getting auto reply status:', error);
//             return {
//                 runningCount: 0,
//                 processes: []
//             };
//         }
//     });
// } 