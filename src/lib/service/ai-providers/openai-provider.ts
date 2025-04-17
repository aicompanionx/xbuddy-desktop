import { OpenAI } from 'openai';
import { ImageService } from '../image-service';
import { IMAGE_ANALYSIS_PROMPT, INSTRUCTION_PROCESSING_PROMPT } from '../../../constants/prompts';

/**
 * OpenAI Service Provider
 * Handles all interactions with the OpenAI API
 */
export class OpenAIProvider {
    private client: OpenAI | null = null;

    /**
     * Initialize OpenAI client
     * @param apiKey API key
     * @param baseURL Optional custom API URL
     */
    initialize(apiKey: string, baseURL?: string): void {
        try {
            this.client = new OpenAI({
                apiKey,
                baseURL: baseURL || undefined
            });
        } catch (error) {
            console.error('Failed to initialize OpenAI client:', error);
            throw error;
        }
    }

    /**
     * Check if client is initialized
     */
    private checkClient(): void {
        if (!this.client) {
            throw new Error('OpenAI client not initialized, please set API key first');
        }
    }

    /**
     * Analyze screenshot
     * @param imageBuffer Image buffer
     * @param prompt Prompt text
     * @returns Analysis result
     */
    async analyzeScreenshot(imageBuffer: Buffer, prompt: string): Promise<string> {
        this.checkClient();

        try {
            // Encode image to base64
            const base64Image = ImageService.imageToBase64(imageBuffer);

            // Send request to OpenAI
            const response = await this.client.chat.completions.create({
                model: 'gpt-4.1',
                messages: [
                    {
                        role: 'system',
                        content: IMAGE_ANALYSIS_PROMPT
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt || 'Please analyze this screenshot and describe what you see, especially the UI elements and their layout.' },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/png;base64,${base64Image}`,
                                    detail: 'high'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            });

            // Return analysis result
            return response.choices[0]?.message?.content || 'Unable to get analysis result';
        } catch (error) {
            console.error('OpenAI screenshot analysis failed:', error);
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
        actions?: any[];
    }> {
        this.checkClient();

        try {
            // Encode image to base64
            const base64Image = ImageService.imageToBase64(imageBuffer);

            // Send request to OpenAI
            const response = await this.client!.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: INSTRUCTION_PROCESSING_PROMPT
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Based on the screenshot, execute the following instruction: ${instruction}
                                Analyze the screen content and provide accurate operation steps.`
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/png;base64,${base64Image}`,
                                    detail: 'high'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1500,
                response_format: { type: 'json_object' }
            });

            const responseContent = response.choices[0]?.message?.content || '';
            if (!responseContent) {
                throw new Error('Unable to get processing result');
            }

            // Parse JSON response
            const parsedResponse = JSON.parse(responseContent);

            return {
                success: true,
                result: parsedResponse.analysis || 'Successfully parsed instruction',
                actions: parsedResponse.steps?.map((step: any) => {
                    const action: any = {
                        type: step.type,
                        description: step.description
                    };

                    // Add parameters based on action type
                    if (step.type === 'move' || step.type === 'click') {
                        action.x = step.params?.x;
                        action.y = step.params?.y;
                        if (step.type === 'click' && step.params?.doubleClick) {
                            action.doubleClick = step.params.doubleClick;
                        }
                    } else if (step.type === 'type') {
                        action.text = step.params?.text;
                    } else if (step.type === 'key') {
                        action.keyName = step.params?.key;
                    }

                    return action;
                }) || []
            };
        } catch (error) {
            console.error('OpenAI instruction processing failed:', error);
            throw error;
        }
    }

    /**
     * Stream analyze screenshot
     * @param imageBuffer Image buffer
     * @param prompt Prompt text
     * @param onChunk Stream response callback
     */
    async streamAnalyzeScreenshot(
        imageBuffer: Buffer,
        prompt: string,
        onChunk: (chunk: string) => void
    ): Promise<void> {
        this.checkClient();

        try {
            // Encode image to base64
            const base64Image = ImageService.imageToBase64(imageBuffer);

            // Send request to OpenAI with streaming enabled
            const stream = await this.client!.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: IMAGE_ANALYSIS_PROMPT
                    },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt || 'Please analyze this screenshot and describe what you see, especially the UI elements and their layout.' },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/png;base64,${base64Image}`,
                                    detail: 'high'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000,
                stream: true
            });

            // Handle streaming response
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    onChunk(content);
                }
            }
        } catch (error) {
            console.error('OpenAI stream analysis failed:', error);
            onChunk(`\n[ERROR] ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Process GUI agent automation
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
        this.checkClient();

        try {
            // Encode image to base64
            const base64Image = ImageService.imageToBase64(imageBuffer);

            // Build user message
            let userContent = `${task}\n\n`;
            if (actionHistory.length > 0) {
                userContent += "## Action History\n" + actionHistory.join("\n") + "\n\n";
            }
            
            // Reinforce format requirements
            userContent += "\n\nPlease output strictly in the following format, do not omit or modify:\n```\nThought: (write your thinking process here)\nAction: (write your action command here)\n```";

            // Send request to OpenAI
            const response = await this.client!.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: userContent
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/png;base64,${base64Image}`,
                                    detail: 'high'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 2000
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
                throw new Error('AI did not return valid action command');
            }

            return {
                success: true,
                thought,
                action
            };
        } catch (error) {
            console.error('OpenAI GUI agent action processing failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}