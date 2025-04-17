import { useState } from 'react';
import { ModelProvider } from './use-ai-model-config';

// Define action types
export interface Action {
    type: 'move' | 'click' | 'type' | 'key';
    x?: number;
    y?: number;
    doubleClick?: boolean;
    text?: string;
    keyName?: string;
    description?: string;
}

export interface VisionActionOptions {
    provider: ModelProvider;
    isConfigured: boolean;
}

export const useVisionActions = (options: VisionActionOptions) => {
    // States
    const [instruction, setInstruction] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Analyze screenshot
    const analyzeScreenshot = async (onCapture?: () => Promise<string | null>): Promise<{
        success: boolean;
        result?: string;
        path?: string | null;
    }> => {
        if (!options.isConfigured) {
            setError('Please set API key first');
            return { success: false };
        }

        setLoading(true);
        setError('');
        setResult('');
        setActions([]);

        try {
            // Screen capture is handled by external logic
            let path: string | null = null;
            if (onCapture) {
                path = await onCapture();
            }
            
            const response = await window.electronAPI.analyzeScreenshot();
            
            if (response.success) {
                setResult(response.result || '');
                return { 
                    success: true, 
                    result: response.result,
                    path 
                };
            } else {
                setError(response.error || 'Failed to analyze screenshot');
                return { success: false };
            }
        } catch (err) {
            const errorMsg = (err as Error).message || 'An unknown error occurred';
            setError(errorMsg);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // Process natural language instruction
    const processInstruction = async (instructionText: string, onCapture?: () => Promise<string | null>): Promise<{
        success: boolean;
        result?: string;
        actions?: Action[];
        path?: string | null;
    }> => {
        if (!options.isConfigured) {
            setError('Please set API key first');
            return { success: false };
        }

        if (!instructionText) {
            setError('Please enter an instruction');
            return { success: false };
        }

        setLoading(true);
        setError('');
        setResult('');
        setActions([]);

        try {
            // Screen capture is handled by external logic
            let path: string | null = null;
            if (onCapture) {
                path = await onCapture();
            }
            
            const response = await window.electronAPI.processInstruction(instructionText);
            
            if (response.success) {
                let actionList: Action[] = [];
                
                if (response.actions) {
                    // Ensure type-safe handling, convert response actions to conform to Action interface
                    actionList = response.actions.map(action => ({
                        type: action.type as 'move' | 'click' | 'type' | 'key',
                        x: action.x,
                        y: action.y,
                        doubleClick: action.doubleClick,
                        text: action.text,
                        keyName: action.keyName,
                        description: action.description
                    }));
                    
                    setActions(actionList);
                }
                
                if (response.result) {
                    setResult(response.result);
                }
                
                return { 
                    success: true, 
                    result: response.result,
                    actions: actionList,
                    path
                };
            } else {
                // Handle specific errors
                if (response.error) {
                    // Handle 404 error - model not found
                    if (response.error.includes('404') || response.error.includes('model not found')) {
                        setError(response.result || `Selected model does not exist or is not accessible (404). Please select another model in settings.`);
                    }
                    // Handle 503 error - service unavailable
                    else if (response.error.includes('503') || response.error.includes('Service Unavailable')) {
                        if (options.provider === 'huggingface') {
                            setError(`Hugging Face service is temporarily unavailable (503). Suggestion: Try switching to OpenAI model, or try again later.`);
                        } else {
                            setError(response.error || 'Failed to process instruction');
                        }
                    } else {
                        setError(response.error || 'Failed to process instruction');
                    }
                } else {
                    setError('Failed to process instruction, unknown error');
                }
                
                return { success: false };
            }
        } catch (err) {
            const errorMsg = (err as Error).message || 'An unknown error occurred';
            
            // Handle specific errors
            if (errorMsg.includes('404') || errorMsg.includes('model not found')) {
                setError(`Selected model does not exist or is not accessible (404). Please select another model in settings.`);
            } else if (errorMsg.includes('503') || errorMsg.includes('Service Unavailable')) {
                if (options.provider === 'huggingface') {
                    setError(`Hugging Face service is temporarily unavailable (503). Suggestion: Try switching to OpenAI model, or try again later.`);
                } else {
                    setError(errorMsg);
                }
            } else {
                setError(errorMsg);
            }
            
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    // Execute action sequence
    const executeActions = async (actionList: Action[]): Promise<boolean> => {
        setLoading(true);
        
        try {
            for (const action of actionList) {
                try {
                    switch (action.type) {
                        case 'move':
                            if (action.x !== undefined && action.y !== undefined) {
                                await window.electronAPI.moveMouse(action.x, action.y);
                            }
                            break;
                        case 'click':
                            if (action.x !== undefined && action.y !== undefined) {
                                await window.electronAPI.clickMouse(
                                    action.x, 
                                    action.y, 
                                    action.doubleClick || false
                                );
                            }
                            break;
                        case 'type':
                            if (action.text) {
                                await window.electronAPI.typeText(action.text);
                            }
                            break;
                        case 'key':
                            if (action.keyName) {
                                await window.electronAPI.pressKey(action.keyName);
                            }
                            break;
                        default:
                            console.warn('Unknown action type:', action);
                    }
                    
                    // Add brief delay between actions
                    await new Promise(resolve => setTimeout(resolve, 300));
                } catch (error) {
                    console.error('Failed to execute action:', action, error);
                    throw error;
                }
            }
            return true;
        } catch (err) {
            setError((err as Error).message || 'Failed to execute actions');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Auto-execute instruction
    const autoExecuteInstruction = async (
        instructionText: string, 
        onCapture?: () => Promise<string | null>
    ): Promise<boolean> => {
        // Only OpenAI mode supports auto-execution
        if (options.provider !== 'openai') {
            setError('Auto-execution of instructions is only supported in OpenAI mode');
            return false;
        }
        
        const result = await processInstruction(instructionText, onCapture);
        
        if (result.success && result.actions && result.actions.length > 0) {
            return await executeActions(result.actions);
        }
        
        return false;
    };

    return {
        instruction,
        setInstruction,
        result,
        actions,
        loading,
        error,
        analyzeScreenshot,
        processInstruction,
        executeActions,
        autoExecuteInstruction
    };
}; 