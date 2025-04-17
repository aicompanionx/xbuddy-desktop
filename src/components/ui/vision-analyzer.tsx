import React from 'react';
import { useAIModelConfig, huggingFaceModels } from '../../hooks/use-ai-model-config';
import { useScreenshot } from '../../hooks/use-screenshot';
import { useVisionActions } from '../../hooks/use-vision-actions';

// Component Props
interface VisionAnalyzerProps {
    className?: string;
}

export function VisionAnalyzer({ className = '' }: VisionAnalyzerProps) {
    // Use custom hooks
    const modelConfig = useAIModelConfig({
        apiKey: 'sk-dYGNH57Caxgu06FuD522Db5cE4E1453aA82bC70eB4230911',
        baseURL: 'https://api.vveai.com/v1'
    });
    
    const screenshot = useScreenshot();
    
    const visionActions = useVisionActions({
        provider: modelConfig.provider,
        isConfigured: modelConfig.isConfigured
    });
    
    // Handle screen capture and analysis
    const handleAnalyzeScreenshot = async () => {
        const result = await visionActions.analyzeScreenshot(async () => {
            return await screenshot.captureScreen();
        });
        
        if (result.success && result.result && result.path) {
            screenshot.addToHistory(result.path, result.result);
        }
    };
    
    // Handle instruction processing
    const handleProcessInstruction = async () => {
        if (!visionActions.instruction) {
            return;
        }
        
        const result = await visionActions.processInstruction(
            visionActions.instruction,
            async () => {
                return await screenshot.captureScreen();
            }
        );
        
        if (result.success && result.result && result.path) {
            screenshot.addToHistory(result.path, result.result);
            
            // Auto-execute actions (if available)
            if (result.actions && result.actions.length > 0 && modelConfig.provider === 'openai') {
                await visionActions.executeActions(result.actions);
            }
        }
    };
    
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
                    <option value="">-- Please Select Model --</option>
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

    return (
        <div className={`p-4 ${className}`}>
            <h2 className="text-xl font-bold mb-4">AI Vision Analyzer</h2>
            
            {!modelConfig.isConfigured ? (
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
                        disabled={modelConfig.loading || visionActions.loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        {modelConfig.loading ? 'Setting...' : 'Set API Key'}
                    </button>
                </div>
            ) : (
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
            )}
            
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Screen Analysis</h3>
                <div className="mb-4">
                    <button
                        onClick={handleAnalyzeScreenshot}
                        disabled={modelConfig.loading || visionActions.loading || !modelConfig.isConfigured}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 mr-2"
                    >
                        {visionActions.loading ? 'Analyzing...' : 'Analyze Current Screen'}
                    </button>
                </div>
                
                {screenshot.screenshotBase64 && (
                    <div className="mb-4 border rounded-md p-2">
                        <h4 className="text-md font-medium mb-1">Current Screenshot:</h4>
                        <img 
                            src={screenshot.screenshotBase64} 
                            alt="Current Screen" 
                            className="w-full h-auto max-h-64 object-contain border"
                        />
                    </div>
                )}
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Natural Language Control</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Instructions</label>
                    <textarea
                        value={visionActions.instruction}
                        onChange={(e) => visionActions.setInstruction(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                        placeholder="Enter natural language instructions, e.g.: Open browser and search for weather"
                    />
                </div>
                <button
                    onClick={handleProcessInstruction}
                    disabled={modelConfig.loading || visionActions.loading || !modelConfig.isConfigured || !visionActions.instruction}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300"
                >
                    {visionActions.loading ? 'Processing...' : 'Execute Instructions'}
                </button>
                
                {modelConfig.provider === 'huggingface' && (
                    <p className="mt-2 text-sm text-amber-600">
                        Note: Hugging Face models mainly support image analysis. Automatic action execution requires OpenAI model.
                    </p>
                )}
            </div>
            
            {(modelConfig.error || visionActions.error || screenshot.error) && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-600 rounded-md">
                    {modelConfig.error || visionActions.error || screenshot.error}
                </div>
            )}
            
            {visionActions.result && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
                    <div className="p-3 bg-gray-100 border rounded-md whitespace-pre-wrap">
                        {visionActions.result}
                    </div>
                </div>
            )}
            
            {visionActions.actions.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Execute Actions</h3>
                    <div className="p-4 bg-gray-100 border rounded-md">
                        <ul className="space-y-3">
                            {visionActions.actions.map((action, index) => (
                                <li key={index} className="border-b pb-2 last:border-b-0">
                                    <div className="font-medium text-blue-600">Step {index + 1}: {action.description || 'No description provided'}</div>
                                    <div className="mt-1 text-sm text-gray-700">
                                        {action.type === 'move' && 
                                            <div className="flex items-center">
                                                <span className="mr-2 bg-purple-100 px-2 py-0.5 rounded-md">Move Mouse</span>
                                                Position: ({action.x}, {action.y})
                                            </div>
                                        }
                                        {action.type === 'click' && 
                                            <div className="flex items-center">
                                                <span className="mr-2 bg-red-100 px-2 py-0.5 rounded-md">
                                                    {action.doubleClick ? 'Double Click' : 'Click'}
                                                </span>
                                                Position: ({action.x}, {action.y})
                                            </div>
                                        }
                                        {action.type === 'type' && 
                                            <div className="flex items-center">
                                                <span className="mr-2 bg-green-100 px-2 py-0.5 rounded-md">Type Text</span>
                                                Content: "{action.text}"
                                            </div>
                                        }
                                        {action.type === 'key' && 
                                            <div className="flex items-center">
                                                <span className="mr-2 bg-yellow-100 px-2 py-0.5 rounded-md">Key Press</span>
                                                Key Name: {action.keyName}
                                            </div>
                                        }
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => visionActions.executeActions(visionActions.actions)}
                            disabled={visionActions.loading || modelConfig.provider === 'huggingface'}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                        >
                            {visionActions.loading ? 'Executing...' : 'Execute These Actions'}
                        </button>
                    </div>
                </div>
            )}
            
            {screenshot.screenshotHistory.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Screenshot History</h3>
                    <div className="space-y-4">
                        {screenshot.screenshotHistory.map((item, index) => (
                            <div key={index} className="border rounded-md p-3">
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">Screenshot #{screenshot.screenshotHistory.length - index}</span>
                                    <span className="text-sm text-gray-500">
                                        {item.timestamp ? item.timestamp.toLocaleTimeString() : new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="mb-3">
                                    {item.base64Data ? (
                                        <img 
                                            src={item.base64Data}
                                            alt={`Screenshot #${index + 1}`}
                                            className="w-full h-auto max-h-64 object-contain border"
                                        />
                                    ) : (
                                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-500">
                                            Unable to load image
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <h4 className="font-medium text-sm mb-1">AI Response:</h4>
                                    <div className="text-sm whitespace-pre-wrap">{item.result}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {screenshot.screenshotHistory.length > 1 && (
                        <button
                            onClick={screenshot.clearHistory}
                            className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Clear History
                        </button>
                    )}
                </div>
            )}
        </div>
    );
} 