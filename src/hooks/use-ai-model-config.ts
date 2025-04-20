import { useState } from 'react';

// Model provider type
export type ModelProvider = 'openai' | 'huggingface';

// Model configuration interface
export interface AIModelConfig {
    provider: ModelProvider;
    apiKey: string;
    baseURL?: string;
    modelName?: string;
}

// Hugging Face preset model list
export const huggingFaceModels = [
    { name: 'ui-tars-7b-dpo-ovu', description: 'Vision Assistant (UI-TARS) - Recommended' },
    { name: 'Salesforce/blip-image-captioning-large', description: 'Image Description (BLIP)' },
    { name: 'microsoft/git-large-coco', description: 'Image Understanding (GIT)' },
    { name: 'llava-hf/llava-1.5-7b-hf', description: 'Vision Language Assistant (LLaVA)' },
    { name: 'custom', description: 'Enter custom model' }
];

export const useAIModelConfig = (initialConfig?: Partial<AIModelConfig>) => {
    // States
    const [provider, setProvider] = useState<ModelProvider>(initialConfig?.provider || 'openai');
    const [apiKey, setApiKey] = useState<string>(initialConfig?.apiKey || 'sk-dYGNH57Caxgu06FuD522Db5cE4E1453aA82bC70eB4230911');
    const [baseURL, setBaseURL] = useState<string>(initialConfig?.baseURL || 'https://api.aaai.vip/v1');
    const [modelName, setModelName] = useState<string>(initialConfig?.modelName || '');
    const [isConfigured, setIsConfigured] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Set AI model configuration
    const setConfig = async () => {
        if (!apiKey) {
            setError('Please enter API key');
            return false;
        }

        if (provider === 'huggingface' && modelName === 'custom' && !baseURL) {
            setError('API address is required when using custom model');
            return false;
        }

        setLoading(true);
        setError('');

        try {
            const config = {
                provider,
                apiKey,
                baseURL: baseURL || undefined,
                modelName: (provider === 'huggingface' && modelName !== 'custom') ? modelName : undefined
            };

            // Explicitly use setOpenAIConfig as a fallback in case setAIModelConfig is not available
            let result;
            try {
                result = await window.electronAPI.setAIModelConfig(config);
            } catch (e) {
                // Try using the old API name
                result = await (window.electronAPI as any).setOpenAIConfig({
                    apiKey: config.apiKey,
                    baseURL: config.baseURL
                });
            }

            if (result.success) {
                setIsConfigured(true);
                setError('');
                return true;
            } else {
                setError(result.error || 'Failed to set API key');
                return false;
            }
        } catch (err) {
            setError((err as Error).message || 'An unknown error occurred');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Reset configuration
    const resetConfig = () => {
        setIsConfigured(false);
    };

    return {
        provider,
        setProvider,
        apiKey,
        setApiKey,
        baseURL,
        setBaseURL,
        modelName,
        setModelName,
        isConfigured,
        loading,
        error,
        setConfig,
        resetConfig
    };
}; 