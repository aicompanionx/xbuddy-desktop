import { OpenAI } from 'openai';
import { ImageService } from '../image-service';
import { IMAGE_ANALYSIS_PROMPT, INSTRUCTION_PROCESSING_PROMPT } from '../../../constants/prompts';

/**
 * Hugging Face Service Provider
 * Handles all interactions with the Hugging Face API
 */
export class HuggingFaceProvider {
    private apiKey: string | null = null;
    private baseURL: string | null = null;
    private modelName: string | null = null;
    private openaiClient: OpenAI | null = null;

    /**
     * Initialize Hugging Face configuration
     * @param apiKey API key
     * @param modelName Model name
     * @param baseURL Optional custom API URL
     */
    initialize(apiKey: string, modelName?: string, baseURL?: string): void {
        this.apiKey = "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";
        this.modelName = modelName || 'ui-tars-7b-dpo-ovu';
        // Use provided baseURL or default endpoint
        this.baseURL = "https://d7k6ll9c2zpa1a3i.us-east-1.aws.endpoints.huggingface.cloud/v1/";

        // Initialize OpenAI client
        this.openaiClient = new OpenAI({
            baseURL: this.baseURL,
            apiKey: this.apiKey
        });

        console.log(`Initialized Hugging Face service, model: ${this.modelName}, endpoint: ${this.baseURL}`);

        // Check model availability
        this.checkModelAvailability().catch(error => {
            console.warn('Model availability check failed:', error.message);
        });
    }

    /**
     * Check if configuration is initialized
     */
    private checkConfig(): void {
        if (!this.apiKey) {
            throw new Error('Hugging Face configuration not initialized, please set API key first');
        }

        if (!this.openaiClient) {
            this.openaiClient = new OpenAI({
                baseURL: this.baseURL,
                apiKey: "this.apiKey"
            });
        }
    }

    /**
     * Get API endpoint URL
     */
    private getApiUrl(): string {
        return this.baseURL || "https://d7k6ll9c2zpa1a3i.us-east-1.aws.endpoints.huggingface.cloud/v1/";
    }

    /**
     * Analyze screenshot
     * @param imageBuffer Image buffer
     * @param prompt Prompt text
     * @returns Analysis result
     */
    async analyzeScreenshot(imageBuffer: Buffer, prompt: string): Promise<string> {
        this.checkConfig();

        try {
            console.log(`Requesting Hugging Face API, model: ${this.modelName}, prompt: ${prompt}`);

            // Convert image to base64 for sending
            const base64Image = ImageService.imageToBase64(imageBuffer);

            // Use OpenAI format API call
            const response = await this.openaiClient.chat.completions.create({
                model: 'tgi', // Use TGI model
                messages: [
                    {
                        role: 'system',
                        content: INSTRUCTION_PROCESSING_PROMPT
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/png;base64,${base64Image}`
                                }
                            },
                            {
                                type: 'text',
                                text: IMAGE_ANALYSIS_PROMPT || 'Describe this image.'
                            }
                        ]
                    }
                ],
                max_tokens: 150
            });

            console.log('Hugging Face API response:', JSON.stringify(response));

            // Return generated text
            return response.choices[0]?.message?.content || 'Unable to get analysis result';
        } catch (error: any) {
            // Print detailed error information
            console.error('Hugging Face API error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            this.handleApiError(error);
            throw error;
        }
    }

    /**
     * Process natural language instruction
     * @param imageBuffer Image buffer
     * @param instruction User instruction
     * @returns Processing result
     */
    async processInstruction(imageBuffer: Buffer, instruction: string): Promise<{
        success: boolean;
        result?: string;
        error?: string;
        actions?: any[];
    }> {
        this.checkConfig();

        try {
            // For Hugging Face, we directly analyze the screen and return results
            const analysisPrompt = `Analyze this screenshot. Based on the following instruction: ${instruction}, please tell me what's on the screen and how to operate it.`;
            const analysis = await this.analyzeScreenshot(imageBuffer, analysisPrompt);

            return {
                success: true,
                result: `Hugging Face model analysis result: ${analysis}`,
                actions: []  // Currently not generating structured actions
            };
        } catch (error: any) {
            // Return appropriate error message based on error type
            if (error.message) {
                if (error.message.includes('404')) {
                    return {
                        success: false,
                        result: `Model does not exist or is inaccessible (404). Please check if model name "${this.modelName}" is correct, or choose another model.`,
                        error: 'Model not found (404)',
                        actions: []
                    };
                }

                if (error.message.includes('503')) {
                    return {
                        success: false,
                        result: 'Hugging Face service temporarily unavailable (503), please try again later or switch to OpenAI model',
                        error: 'Service temporarily unavailable (503)',
                        actions: []
                    };
                }

                if (error.message.includes('415')) {
                    return {
                        success: false,
                        result: 'Hugging Face API does not support current media type (415). This may be due to image format issues or model incompatibility. Please try a different model or OpenAI.',
                        error: 'Unsupported media type (415)',
                        actions: []
                    };
                }
            }

            console.error('Hugging Face instruction processing failed:', error);
            return {
                success: false,
                error: error.message || 'Unknown error',
                result: 'Error occurred while processing instruction, please check console logs for details',
                actions: []
            };
        }
    }

    /**
     * Handle API errors
     * @param error Error object
     */
    private handleApiError(error: any): void {
        // Handle 404 error - Model not found
        if (error.response && error.response.status === 404) {
            console.error(`Model '${this.modelName}' does not exist or is inaccessible`);
            throw new Error(`Model '${this.modelName}' does not exist or is inaccessible (404). Please check if model name is correct, or choose another model.`);
        }

        // Handle 503 error - Service unavailable
        if (error.response && error.response.status === 503) {
            console.error('Hugging Face service temporarily unavailable');
            throw new Error('Hugging Face service temporarily unavailable (503), please try again later or try using OpenAI model');
        }

        // Handle 401 error - Unauthorized
        if (error.response && error.response.status === 401) {
            console.error('Invalid or unauthorized Hugging Face API key');
            throw new Error('Invalid or unauthorized Hugging Face API key (401). Please check if API key is correct.');
        }

        console.error('Failed to call Hugging Face API:', error);
    }

    /**
     * Check model availability
     */
    private async checkModelAvailability(): Promise<boolean> {
        this.checkConfig();

        try {
            console.log(`Checking model "${this.modelName}" availability...`);

            // Simple request to test connection
            const response = await this.openaiClient.chat.completions.create({
                model: 'tgi',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 5
            });

            console.log(`Model "${this.modelName}" is available, response:`, response.choices[0]?.message?.content);
            return true;
        } catch (error: any) {
            // Log error but don't throw
            console.error(`Error during model check:`, error.message);
            return false;
        }
    }

    /**
     * Stream analyze screenshot
     * @param imageBuffer Image buffer
     * @param prompt Prompt text
     * @param onChunk Stream response callback function
     */
    async streamAnalyzeScreenshot(
        imageBuffer: Buffer,
        prompt: string,
        onChunk: (chunk: string) => void
    ): Promise<void> {
        this.checkConfig();

        try {
            console.log(`Requesting Hugging Face API stream response, model: ${this.modelName}, prompt: ${prompt}`);

            // Convert image to base64 for sending
            const base64Image = ImageService.imageToBase64(imageBuffer);

            // Use OpenAI format API call with streaming enabled
            const stream = await this.openaiClient.chat.completions.create({
                model: 'tgi', // Use TGI model
                messages: [
                    {
                        role: 'system',
                        content: IMAGE_ANALYSIS_PROMPT
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/png;base64,${base64Image}`
                                }
                            },
                            {
                                type: 'text',
                                text: prompt || 'Describe this image.'
                            }
                        ]
                    }
                ],
                max_tokens: 500,
                stream: true
            });

            console.log('Hugging Face API stream started receiving');

            // Handle stream response
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    onChunk(content);
                }
            }

            console.log('Hugging Face API stream response completed');
        } catch (error: any) {
            // Print detailed error information
            console.error('Hugging Face API stream response error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            onChunk(`\n[ERROR] ${error.message}`);
            this.handleApiError(error);
        }
    }

    /**
     * Process GUI automation
     * @param imageBuffer Image buffer
     * @param task Task description
     * @param systemPrompt System prompt
     * @param actionHistory Action history records
     * @returns Agent response result
     */
    async processGuiAction(
        imageBuffer: Buffer,
        task: string,
        systemPrompt: string,
        actionHistory: string[] = []
    ): Promise<{
        success: boolean;
        thought?: string;
        action?: string;
        error?: string;
    }> {
        this.checkConfig();

        try {
            console.log(`Hugging Face GUI agent request, model: ${this.modelName}, task: ${task}`);

            // Convert image to base64
            const base64Image = ImageService.imageToBase64(imageBuffer);

            // Build user message
            let userContent = `${task}\n\n`;
            if (actionHistory.length > 0) {
                userContent += "## Action History\n" + actionHistory.join("\n") + "\n\n";
            }
            
            // Enforce format requirements
            userContent += "\n\nPlease output strictly in the following format, do not omit or modify:\n```\nThought: (write your thinking process here)\nAction: (write your action instruction here)\n```";

            // Use OpenAI format API call
            const response = await this.openaiClient.chat.completions.create({
                model: 'tgi',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/png;base64,${base64Image}`
                                }
                            },
                            {
                                type: 'text',
                                text: userContent
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            });

            const responseContent = response.choices[0]?.message?.content || '';
            if (!responseContent) {
                throw new Error('Unable to get processing result');
            }

            // Parse thought and action
            const thoughtMatch = responseContent.match(/Thought:(.*?)(?=Action:|$)/s);
            const actionMatch = responseContent.match(/Action:(.*?)$/s);

            const thought = thoughtMatch ? thoughtMatch[1].trim() : '';
            const action = actionMatch ? actionMatch[1].trim() : '';

            if (!action) {
                throw new Error('AI did not return valid action instruction');
            }

            return {
                success: true,
                thought,
                action
            };
        } catch (error: any) {
            console.error('Hugging Face GUI agent processing failed:', error);
            this.handleApiError(error);
            return {
                success: false,
                error: error.message || 'Unknown error'
            };
        }
    }
}