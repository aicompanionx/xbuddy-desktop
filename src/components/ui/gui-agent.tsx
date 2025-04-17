import React, { useState, useRef } from 'react';
import { SYSTEM_PROMPT, SYSTEM_PROMPT_TEMPLATE, DEFAULT_ACTION_SPACES } from '../../constants/prompts';

// Component props
interface GuiAgentProps {
    className?: string;
}

export function GuiAgent({ className = '' }: GuiAgentProps) {
    // State
    const [task, setTask] = useState<string>('');
    const [isCustomPrompt, setIsCustomPrompt] = useState<boolean>(false);
    const [customPrompt, setCustomPrompt] = useState<string>(SYSTEM_PROMPT);
    const [actionHistory, setActionHistory] = useState<string[]>([]);
    const [thought, setThought] = useState<string>('');
    const [action, setAction] = useState<string>('');
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [customActionSpaces, setCustomActionSpaces] = useState<string>(DEFAULT_ACTION_SPACES);
    
    // References
    const actionHistoryRef = useRef<string[]>([]);
    
    // Handle prompt toggle
    const handlePromptToggle = () => {
        setIsCustomPrompt(!isCustomPrompt);
        if (isCustomPrompt) {
            // Switch back to default prompt
            setCustomPrompt(SYSTEM_PROMPT);
        }
    };
    
    // Handle custom action spaces
    const handleUpdatePromptWithCustomActions = () => {
        const newPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{{action_spaces_holder}}', customActionSpaces);
        setCustomPrompt(newPrompt);
    };
    
    // Get AI agent's next action
    const handleGetNextAction = async () => {
        if (!task) {
            setError('Please enter a task description');
            return;
        }
        
        setLoading(true);
        setError('');
        setThought('');
        setAction('');
        setResult('');
        
        try {
            // Get current prompt in use
            const promptToUse = isCustomPrompt ? customPrompt : SYSTEM_PROMPT;
            
            // Get agent's next action
            const response = await window.electronAPI.processGuiAction(
                task,
                promptToUse,
                actionHistoryRef.current
            );
            
            if (response.success && response.action) {
                setThought(response.thought || '');
                setAction(response.action);
            } else {
                setError(response.error || 'Failed to get next action');
            }
        } catch (err) {
            setError((err as Error).message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    // Execute AI agent operation
    const handleExecuteAction = async () => {
        if (!action) {
            setError('No executable operation');
            return;
        }
        
        setLoading(true);
        setResult('');
        setError('');
        
        try {
            // Execute operation
            const response = await window.electronAPI.executeGuiAction(action);
            
            if (response.success) {
                setResult(response.message);
                
                // Update history
                const newHistoryItem = `${new Date().toLocaleTimeString()}: ${action} -> ${response.message}`;
                actionHistoryRef.current = [...actionHistoryRef.current, newHistoryItem];
                setActionHistory(actionHistoryRef.current);
            } else {
                setError(response.message || 'Failed to execute operation');
            }
        } catch (err) {
            setError((err as Error).message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    // Clear history
    const handleClearHistory = () => {
        actionHistoryRef.current = [];
        setActionHistory([]);
    };
    
    return (
        <div className={`p-4 ${className}`}>
            <h2 className="text-xl font-bold mb-4">GUI Agent Automation</h2>
            
            <div className="mb-6 grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Task Description</label>
                    <textarea
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                        placeholder="Example: Open Notepad and type 'Hello, World'"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                        <p>Tip: For hotkey operations, you can instruct AI to use formats like: "Use hotkey Ctrl+C", "Press Enter key", etc.</p>
                        <p>Supported hotkeys include: Ctrl, Alt, Shift, Enter, Tab, Arrow keys, F1-F12, etc.</p>
                    </div>
                </div>
                
                <div className="flex items-center">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isCustomPrompt}
                            onChange={handlePromptToggle}
                            className="mr-2"
                        />
                        Custom Prompts and Action Spaces
                    </label>
                </div>
                
                {isCustomPrompt && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Custom Action Spaces</label>
                            <textarea
                                value={customActionSpaces}
                                onChange={(e) => setCustomActionSpaces(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md min-h-[150px] font-mono text-sm"
                            />
                            <button
                                onClick={handleUpdatePromptWithCustomActions}
                                className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Update Prompt
                            </button>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">System Prompt</label>
                            <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md min-h-[200px] font-mono text-sm"
                            />
                        </div>
                    </div>
                )}
                
                <div className="flex gap-2">
                    <button
                        onClick={handleGetNextAction}
                        disabled={loading || !task}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        {loading ? 'Processing...' : 'Get Next Action'}
                    </button>
                    
                    <button
                        onClick={handleClearHistory}
                        disabled={loading || actionHistory.length === 0}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300"
                    >
                        Clear History
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-600 rounded-md">
                    {error}
                </div>
            )}
            
            {thought && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Thinking Process</h3>
                    <div className="p-3 bg-yellow-50 border rounded-md whitespace-pre-wrap">
                        {thought}
                    </div>
                </div>
            )}
            
            {action && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Next Action</h3>
                    <div className="p-3 bg-blue-50 border rounded-md font-mono">
                        {action}
                    </div>
                    <button
                        onClick={handleExecuteAction}
                        disabled={loading}
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
                    >
                        {loading ? 'Executing...' : 'Execute This Action'}
                    </button>
                </div>
            )}
            
            {result && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Execution Result</h3>
                    <div className="p-3 bg-green-50 border rounded-md">
                        {result}
                    </div>
                </div>
            )}
            
            {actionHistory.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Action History</h3>
                    <div className="p-3 bg-gray-50 border rounded-md max-h-60 overflow-y-auto">
                        <ul className="space-y-1">
                            {actionHistory.map((item, index) => (
                                <li key={index} className="border-b last:border-b-0 pb-1">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
} 