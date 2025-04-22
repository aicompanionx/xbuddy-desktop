import { ipcRenderer } from 'electron';

// Model provider type
type ModelProvider = 'openai' | 'huggingface';

// AI model configuration interface
interface AIModelConfig {
    provider: ModelProvider;
    apiKey: string;
    baseURL?: string;
    modelName?: string;
}

// Action type interface
interface Action {
    type: 'move' | 'click' | 'type' | 'key';
    x?: number;
    y?: number;
    doubleClick?: boolean;
    text?: string;
    keyName?: string;
}

// GUI agent response interface
interface GuiAgentResponse {
    success: boolean;
    thought?: string;
    action?: string;
    error?: string;
}

/**
 * Vision analysis related APIs
 */
export const visionApi = {
    // Set AI model configuration
    setAIModelConfig: async (config: AIModelConfig): Promise<{ success: boolean; error?: string }> => {
        return await ipcRenderer.invoke('set-ai-model-config', config);
    },

    // Analyze screenshot
    analyzeScreenshot: async (prompt?: string): Promise<{ success: boolean; result?: string; error?: string }> => {
        return await ipcRenderer.invoke('analyze-screenshot', { prompt });
    },

    // Process natural language instruction
    processInstruction: async (instruction: string): Promise<{
        success: boolean;
        result?: string;
        error?: string;
        actions?: Action[];
    }> => {
        return await ipcRenderer.invoke('process-instruction', { instruction });
    },
    
    // Stream analyze screenshot
    streamAnalyzeScreenshot: (
        prompt: string, 
        onChunk: (chunk: string, done: boolean, error?: boolean) => void
    ): string => {
        // Generate unique request ID
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Set up listener for stream response
        const listener = (_event: any, data: { 
            chunk: string; 
            requestId: string;
            done: boolean;
            error?: boolean;
        }) => {
            // Only process matching request ID
            if (data.requestId === requestId) {
                onChunk(data.chunk, data.done, data.error);
                
                // Remove listener if done
                if (data.done) {
                    ipcRenderer.removeListener('stream-analyze-response', listener);
                }
            }
        };
        
        // Register listener
        ipcRenderer.on('stream-analyze-response', listener);
        
        // Send request
        const result = ipcRenderer.sendSync('stream-analyze-screenshot', { prompt, requestId });
        
        if (!result.success) {
            // Remove listener if request failed
            ipcRenderer.removeListener('stream-analyze-response', listener);
        }
        
        // Return request ID for potential cancellation
        return requestId;
    },

    // Process GUI agent automation
    processGuiAction: async (
        task: string,
        systemPrompt: string,
        actionHistory: string[] = []
    ): Promise<GuiAgentResponse> => {
        return await ipcRenderer.invoke('process-gui-action', {
            task,
            systemPrompt,
            actionHistory
        });
    },

    // Execute GUI agent action
    executeGuiAction: async (actionText: string): Promise<{
        success: boolean;
        message: string;
    }> => {
        return await ipcRenderer.invoke('execute-gui-action', { actionText });
    }
}; 