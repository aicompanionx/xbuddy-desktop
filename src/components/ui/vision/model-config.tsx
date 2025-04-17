import React from 'react';
import { useAIModelConfig, ModelProvider, huggingFaceModels } from '../../../hooks/use-ai-model-config';

interface ModelConfigProps {
    modelConfig: ReturnType<typeof useAIModelConfig>;
    loading: boolean;
}

export function ModelConfig({ modelConfig, loading }: ModelConfigProps) {
    // Render Hugging Face model selector
    const renderHuggingFaceModelSelector = () => {
        if (modelConfig.provider !== 'huggingface') return null;

        return (
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Model</label>
                <select
                    value={modelConfig.modelName}
                    onChange={(e) => modelConfig.setModelName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                >
                    <option value="">-- Select a Model --</option>
                    {huggingFaceModels.map(model => (
                        <option key={model.name} value={model.name}>
                            {model.description} ({model.name})
                        </option>
                    ))}
                </select>
                
                {modelConfig.modelName === 'Custom' && (
                    <div className="mt-2">
                        <label className="block text-sm font-medium mb-1">Custom Model URL</label>
                        <input
                            type="text"
                            value={modelConfig.baseURL}
                            onChange={(e) => modelConfig.setBaseURL(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="https://api-inference.huggingface.co/models/your-model"
                        />
                    </div>
                )}
            </div>
        );
    };

    if (!modelConfig.isConfigured) {
        return (
            <div className="mb-6 p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-2">API Configuration</h3>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Select Model Provider</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="provider"
                                value="openai"
                                checked={modelConfig.provider === 'openai'}
                                onChange={() => modelConfig.setProvider('openai')}
                                className="mr-2"
                            />
                            OpenAI (Full Features)
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="provider"
                                value="huggingface"
                                checked={modelConfig.provider === 'huggingface'}
                                onChange={() => modelConfig.setProvider('huggingface')}
                                className="mr-2"
                            />
                            Hugging Face (Basic Features)
                        </label>
                    </div>
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        {modelConfig.provider === 'openai' ? 'OpenAI API Key' : 'Hugging Face API Key'}
                    </label>
                    <input
                        type="password"
                        value={modelConfig.apiKey}
                        onChange={(e) => modelConfig.setApiKey(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder={modelConfig.provider === 'openai' ? 'sk-...' : 'hf_...'}
                    />
                </div>
                
                {renderHuggingFaceModelSelector()}
                
                {modelConfig.provider === 'openai' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Custom API URL (Optional)</label>
                        <input
                            type="text"
                            value={modelConfig.baseURL}
                            onChange={(e) => modelConfig.setBaseURL(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="https://api.openai.com/v1"
                        />
                    </div>
                )}
                
                <button
                    onClick={modelConfig.setConfig}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                >
                    {loading ? 'Setting...' : 'Set API Key'}
                </button>
            </div>
        );
    }
    
    return (
        <div className="mb-4">
            <span className="text-green-500 font-medium">
                ✓ {modelConfig.provider === 'openai' ? 'OpenAI' : 'Hugging Face'} API Key Configured
            </span>
            <button
                onClick={modelConfig.resetConfig}
                className="ml-2 text-sm text-blue-500 hover:underline"
            >
                Change
            </button>
        </div>
    );
}