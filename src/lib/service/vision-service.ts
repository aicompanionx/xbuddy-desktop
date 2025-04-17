import { ipcMain } from 'electron';
import { AIService, type ModelProvider } from './ai-service';
import { GuiActionParser } from './gui-action-parser';

/**
 * Setup IPC handlers for vision analysis service
 */
export const setupVisionHandlers = () => {
    const aiService = AIService.getInstance();
    
    // Handle API configuration requests
    ipcMain.handle('set-ai-model-config', async (_event, config) => {
        try {
            aiService.initializeModel(config);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });
    
    // Legacy API support (kept for backwards compatibility)
    ipcMain.handle('set-openai-config', async (_event, config) => {
        try {
            // Convert old format to new format
            const newConfig = {
                provider: 'openai' as ModelProvider,
                apiKey: config.apiKey,
                baseURL: config.baseURL
            };
            aiService.initializeModel(newConfig);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Handle screenshot analysis requests
    ipcMain.handle('analyze-screenshot', async (_event, { prompt }) => {
        try {
            // Analyze screenshot
            const result = await aiService.analyzeScreenshot(prompt);
            
            return { success: true, result };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    // Handle natural language instruction requests
    ipcMain.handle('process-instruction', async (_event, { instruction }) => {
        try {
            const result = await aiService.processInstruction(instruction);
            return result;
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });
    
    // Handle streaming analysis requests
    ipcMain.on('stream-analyze-screenshot', (event, { prompt, requestId }) => {
        // Create callback to send response chunks back to renderer
        const onChunk = (chunk: string) => {
            // Check if destroyed
            if (!event.sender.isDestroyed()) {
                event.sender.send('stream-analyze-response', { 
                    chunk, 
                    requestId,
                    done: false
                });
            }
        };
        
        // Start streaming analysis
        aiService.streamAnalyzeScreenshot(prompt, onChunk)
            .then(() => {
                if (!event.sender.isDestroyed()) {
                    event.sender.send('stream-analyze-response', {
                        chunk: '',
                        requestId,
                        done: true
                    });
                }
            })
            .catch((error) => {
                if (!event.sender.isDestroyed()) {
                    event.sender.send('stream-analyze-response', {
                        chunk: `\n[Error] ${error.message}`,
                        requestId,
                        done: true,
                        error: true
                    });
                }
            });
            
        // Immediate response indicating request received
        event.returnValue = { success: true, message: 'Request received, starting stream analysis' };
    });

    // Handle GUI agent requests
    ipcMain.handle('process-gui-action', async (_event, { task, systemPrompt, actionHistory }) => {
        try {
            const result = await aiService.processGuiAction(task, systemPrompt, actionHistory);
            return result;
        } catch (error) {
            return { 
                success: false, 
                error: (error as Error).message
            };
        }
    });

    // Execute GUI action commands - Simplified version using GuiActionParser
    ipcMain.handle('execute-gui-action', async (_event, { actionText }) => {
        try {
            console.log('Executing GUI action:', actionText);
            
            // Parse action using GuiActionParser
            const parsedAction = GuiActionParser.parseAction(actionText);
            
            if (parsedAction) {
                // Execute parsed action
                return await GuiActionParser.executeAction(parsedAction);
            } else {
                return { 
                    success: false, 
                    message: `Unable to parse action command: ${actionText}, please ensure correct format` 
                };
            }
        } catch (error) {
            console.error('Failed to execute GUI action:', error);
            return { 
                success: false, 
                message: `Execution failed: ${(error as Error).message}` 
            };
        }
    });
}; 