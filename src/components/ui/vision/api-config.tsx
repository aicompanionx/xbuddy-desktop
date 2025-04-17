import React from 'react';

interface ApiConfigProps {
    apiConfig: {
        apiKey: string;
        baseUrl: string;
        model: string;
    };
    onApiConfigChange: (key: 'apiKey' | 'baseUrl' | 'model', value: string) => void;
    onSaveConfig: () => void;
    showConfig: boolean;
    toggleConfigVisibility: () => void;
}

export function ApiConfig({
    apiConfig,
    onApiConfigChange,
    onSaveConfig,
    showConfig,
    toggleConfigVisibility
}: ApiConfigProps) {
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">API Configuration</h3>
                <button 
                    onClick={toggleConfigVisibility}
                    className="text-blue-500 hover:text-blue-700"
                >
                    {showConfig ? 'Hide Config' : 'Show Config'}
                </button>
            </div>
            
            {showConfig && (
                <div className="p-4 border rounded-md bg-gray-50">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">API Key</label>
                        <input
                            type="password"
                            value={apiConfig.apiKey}
                            onChange={(e) => onApiConfigChange('apiKey', e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter your API key"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">API Base URL</label>
                        <input
                            type="text"
                            value={apiConfig.baseUrl}
                            onChange={(e) => onApiConfigChange('baseUrl', e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter API base URL"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Model</label>
                        <select
                            value={apiConfig.model}
                            onChange={(e) => onApiConfigChange('model', e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="gpt-4-vision-preview">GPT-4 Vision</option>
                            <option value="gpt-4o">GPT-4o</option>
                        </select>
                    </div>
                    
                    <button
                        onClick={onSaveConfig}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Save Configuration
                    </button>
                </div>
            )}
        </div>
    );
}