import { OpenAIProvider } from './ai-providers/openai-provider';
import { HuggingFaceProvider } from './ai-providers/huggingface-provider';
import { ImageService } from './image-service';
import { OperationTrackerService, Operation } from './operation-tracker-service';

// Model provider type
export type ModelProvider = 'openai' | 'huggingface';

// AI model configuration
export interface AIModelConfig {
    provider: ModelProvider;
    apiKey: string;
    baseURL?: string;
    modelName?: string;
}

/**
 * AI Service
 * Unified management of all AI providers, providing a consistent interface
 */
export class AIService {
    private static instance: AIService;
    private openaiProvider: OpenAIProvider;
    private huggingfaceProvider: HuggingFaceProvider;
    private currentProvider: ModelProvider | null = null;
    private operationTracker: OperationTrackerService;
    
    private constructor() {
        this.openaiProvider = new OpenAIProvider();
        this.huggingfaceProvider = new HuggingFaceProvider();
        this.operationTracker = OperationTrackerService.getInstance();
    }
    
    /**
     * Get singleton instance
     */
    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }
    
    /**
     * Initialize AI model
     * @param config Model configuration
     */
    public initializeModel(config: AIModelConfig): void {
        this.currentProvider = config.provider;
        
        if (config.provider === 'openai') {
            this.openaiProvider.initialize(config.apiKey, config.baseURL);
        } else if (config.provider === 'huggingface') {
            this.huggingfaceProvider.initialize(config.apiKey, config.modelName, config.baseURL);
        } else {
            throw new Error(`Unsupported model provider: ${config.provider}`);
        }
    }
    
    /**
     * Get current provider type
     */
    public getCurrentProvider(): ModelProvider | null {
        return this.currentProvider;
    }
    
    /**
     * Analyze screenshot
     * @param prompt Prompt text
     * @returns Analysis result
     */
    public async analyzeScreenshot(prompt: string): Promise<string> {
        if (!this.currentProvider) {
            throw new Error('AI model not initialized, please set configuration first');
        }
        
        try {
            // Get screenshot
            const { buffer, path } = await ImageService.captureScreenshot();
            
            let result: string;
            
            // Select processing method based on current provider
            if (this.currentProvider === 'openai') {
                result = await this.openaiProvider.analyzeScreenshot(buffer, prompt);
            } else if (this.currentProvider === 'huggingface') {
                result = await this.huggingfaceProvider.analyzeScreenshot(buffer, prompt);
            } else {
                throw new Error(`Unsupported model provider: ${this.currentProvider}`);
            }
            
            // Clean up temporary file
            ImageService.cleanupTempFile(path);
            
            return result;
        } catch (error) {
            console.error('Failed to analyze screenshot:', error);
            throw error;
        }
    }
    
    /**
     * Process natural language instruction
     * @param instruction Natural language instruction
     * @returns Processing result
     */
    public async processInstruction(instruction: string): Promise<{
        success: boolean;
        result?: string;
        error?: string;
        actions?: any[];
    }> {
        if (!this.currentProvider) {
            throw new Error('AI model not initialized, please set configuration first');
        }
        
        try {
            // Get screenshot
            const { buffer, path } = await ImageService.captureScreenshot();
            
            let result;
            
            // Select processing method based on current provider
            if (this.currentProvider === 'openai') {
                result = await this.openaiProvider.processInstruction(buffer, instruction);
            } else if (this.currentProvider === 'huggingface') {
                result = await this.huggingfaceProvider.processInstruction(buffer, instruction);
            } else {
                throw new Error(`Unsupported model provider: ${this.currentProvider}`);
            }
            
            // Clean up temporary file
            ImageService.cleanupTempFile(path);

            // If processing is successful and actions list is returned, initialize operation tracking
            if (result.success && result.actions && result.actions.length > 0) {
                const operations = result.actions.map((action: any) => ({
                    description: action.description || 'No description provided',
                    type: action.type,
                    parameters: {
                        x: action.x,
                        y: action.y,
                        doubleClick: action.doubleClick,
                        text: action.text,
                        keyName: action.keyName
                    }
                }));
                
                this.operationTracker.initializeTask(instruction, operations);
            }
            
            return result;
        } catch (error: any) {
            console.error('Failed to process instruction:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Stream analyze screenshot
     * @param prompt Prompt text
     * @param onChunk Callback function for each chunk of data received
     */
    public async streamAnalyzeScreenshot(
        prompt: string,
        onChunk: (chunk: string) => void
    ): Promise<void> {
        if (!this.currentProvider) {
            onChunk("[Error] AI model not initialized, please set configuration first");
            throw new Error('AI model not initialized, please set configuration first');
        }
        
        try {
            // Get screenshot
            const { buffer, path } = await ImageService.captureScreenshot();
            
            // Select processing method based on current provider
            if (this.currentProvider === 'openai') {
                await this.openaiProvider.streamAnalyzeScreenshot(buffer, prompt, onChunk);
            } else if (this.currentProvider === 'huggingface') {
                await this.huggingfaceProvider.streamAnalyzeScreenshot(buffer, prompt, onChunk);
            } else {
                onChunk(`[Error] Unsupported model provider: ${this.currentProvider}`);
                throw new Error(`Unsupported model provider: ${this.currentProvider}`);
            }
            
            // Clean up temporary file
            ImageService.cleanupTempFile(path);
        } catch (error) {
            console.error('Failed to stream analyze screenshot:', error);
            // Error messages already passed through onChunk in provider methods
        }
    }

    /**
     * Process GUI agent automation
     * @param task Task description
     * @param systemPrompt System prompt
     * @param actionHistory Action history records
     * @returns Agent response result
     */
    public async processGuiAction(
        task: string,
        systemPrompt: string,
        actionHistory: string[] = []
    ): Promise<{
        success: boolean;
        thought?: string;
        action?: string;
        error?: string;
    }> {
        if (!this.currentProvider) {
            return {
                success: false,
                error: 'AI model not initialized, please set configuration first'
            };
        }
        
        try {
            // Get screenshot
            const { buffer, path } = await ImageService.captureScreenshot();
            
            let result;
            
            // Select processing method based on current provider
            if (this.currentProvider === 'openai') {
                result = await this.openaiProvider.processGuiAction(buffer, task, systemPrompt, actionHistory);
            } else if (this.currentProvider === 'huggingface') {
                result = await this.huggingfaceProvider.processGuiAction(buffer, task, systemPrompt, actionHistory);
            } else {
                throw new Error(`Unsupported model provider: ${this.currentProvider}`);
            }
            
            // Clean up temporary file
            ImageService.cleanupTempFile(path);
            
            return result;
        } catch (error: any) {
            console.error('Failed to process GUI agent action:', error);
            return {
                success: false,
                error: error.message || 'Unknown error'
            };
        }
    }

    /**
     * Process task with operation tracking
     * @param task Task description
     * @returns Processing result
     */
    public async processTaskWithTracking(task: string): Promise<{
        success: boolean;
        result?: string;
        error?: string;
        operations?: Operation[];
    }> {
        try {
            // Process task and get operation list
            const result = await this.processInstruction(task);
            
            if (!result.success) {
                return result;
            }
            
            // Attach operation tracking information
            return {
                ...result,
                operations: this.operationTracker.getAllOperations()
            };
        } catch (error: any) {
            console.error('Failed to process tracked task:', error);
            return {
                success: false,
                error: error.message || 'Unknown error'
            };
        }
    }
    
    /**
     * Mark operation as completed and analyze next step
     * @param operationId Operation ID
     * @param prompt Prompt text
     * @returns Next step analysis result
     */
    public async completeOperationAndAnalyze(operationId: string, prompt?: string): Promise<{
        success: boolean;
        result?: string;
        error?: string;
        taskSummary?: string;
        isTaskCompleted?: boolean;
    }> {
        try {
            // Mark operation as completed
            this.operationTracker.markOperationCompleted(operationId);
            
            // Check if all tasks are completed
            const isTaskCompleted = this.operationTracker.isTaskCompleted();
            const taskSummary = this.operationTracker.getTaskSummary();
            
            // If a new prompt is provided or the task is not complete, re-analyze
            if (prompt || !isTaskCompleted) {
                // Build prompt with operation status
                const enhancedPrompt = prompt || 
                    `Please analyze the current screen and tell me what to do next. Here is the current task status:\n${taskSummary}`;
                
                // Re-capture and analyze
                const result = await this.analyzeScreenshot(enhancedPrompt);
                
                return {
                    success: true,
                    result,
                    taskSummary,
                    isTaskCompleted
                };
            }
            
            return {
                success: true,
                result: 'All operations completed!',
                taskSummary,
                isTaskCompleted
            };
        } catch (error: any) {
            console.error('Failed to complete operation and analyze:', error);
            return {
                success: false,
                error: error.message || 'Unknown error'
            };
        }
    }
    
    /**
     * Mark operation at specified index as completed and analyze next step
     * @param index Operation index
     * @param prompt Prompt text
     * @returns Next step analysis result
     */
    public async completeOperationByIndexAndAnalyze(index: number, prompt?: string): Promise<{
        success: boolean;
        result?: string;
        error?: string;
        taskSummary?: string;
        isTaskCompleted?: boolean;
    }> {
        try {
            // Mark operation as completed
            this.operationTracker.markOperationCompletedByIndex(index);
            
            // Check if all tasks are completed
            const isTaskCompleted = this.operationTracker.isTaskCompleted();
            const taskSummary = this.operationTracker.getTaskSummary();
            
            // If a new prompt is provided or the task is not complete, re-analyze
            if (prompt || !isTaskCompleted) {
                // Build prompt with operation status
                const enhancedPrompt = prompt || 
                    `Please analyze the current screen and tell me what to do next. Here is the current task status:\n${taskSummary}`;
                
                // Re-capture and analyze
                const result = await this.analyzeScreenshot(enhancedPrompt);
                
                return {
                    success: true,
                    result,
                    taskSummary,
                    isTaskCompleted
                };
            }
            
            return {
                success: true,
                result: 'All operations completed!',
                taskSummary,
                isTaskCompleted
            };
        } catch (error: any) {
            console.error('Failed to complete operation (by index) and analyze:', error);
            return {
                success: false,
                error: error.message || 'Unknown error'
            };
        }
    }
    
    /**
     * Get current task summary
     */
    public getTaskSummary(): string {
        return this.operationTracker.getTaskSummary();
    }
    
    /**
     * Reset current task
     */
    public resetTask(): void {
        this.operationTracker.resetTask();
    }
} 