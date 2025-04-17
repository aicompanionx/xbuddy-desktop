import React, { useState, useEffect } from 'react';
import { AIService } from '../../lib/service/ai-service';
import { Operation } from '../../lib/service/operation-tracker-service';

interface TrackedAIAssistantProps {
    onOperationComplete?: (operationId: string) => void;
}

export const TrackedAIAssistant: React.FC<TrackedAIAssistantProps> = ({ 
    onOperationComplete 
}) => {
    const [task, setTask] = useState('');
    const [result, setResult] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [operations, setOperations] = useState<Operation[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [taskSummary, setTaskSummary] = useState<string>('');
    
    const aiService = AIService.getInstance();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task.trim()) return;
        
        setIsProcessing(true);
        setError(null);
        
        try {
            const response = await aiService.processTaskWithTracking(task);
            
            if (response.success) {
                setResult(response.result || '');
                if (response.operations) {
                    setOperations(response.operations);
                }
                setTaskSummary(aiService.getTaskSummary());
            } else {
                setError(response.error || 'Failed to process task');
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleOperationComplete = async (operationId: string) => {
        setIsProcessing(true);
        
        try {
            const response = await aiService.completeOperationAndAnalyze(operationId);
            
            if (response.success) {
                setResult(response.result || '');
                setTaskSummary(response.taskSummary || '');
                
                // If all operations are completed, can do additional processing
                if (response.isTaskCompleted) {
                    console.log('All operations completed!');
                }
                
                // Callback to notify parent component
                if (onOperationComplete) {
                    onOperationComplete(operationId);
                }
            } else {
                setError(response.error || 'Failed to mark operation as complete');
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const resetTask = () => {
        aiService.resetTask();
        setTask('');
        setResult('');
        setOperations([]);
        setTaskSummary('');
        setError(null);
    };
    
    // Get latest operations from the operation service
    const refreshOperations = () => {
        const completedOps = aiService.getTaskSummary();
        setTaskSummary(completedOps);
    };
    
    return (
        <div className="p-6 max-w-4xl mx-auto bg-slate-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">AI Assistant with Operation Tracking</h2>
            
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="mb-4">
                    <label htmlFor="task" className="block text-sm font-medium mb-1">
                        Enter task:
                    </label>
                    <input
                        id="task"
                        type="text"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Please enter the task you want to execute..."
                        disabled={isProcessing}
                    />
                </div>
                <div className="flex space-x-2">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={isProcessing || !task.trim()}
                    >
                        {isProcessing ? 'Processing...' : 'Submit Task'}
                    </button>
                    <button
                        type="button"
                        onClick={resetTask}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        disabled={isProcessing}
                    >
                        Reset Task
                    </button>
                </div>
            </form>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {result && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">AI Analysis Result:</h3>
                    <div className="p-3 bg-white border border-gray-300 rounded whitespace-pre-wrap">
                        {result}
                    </div>
                </div>
            )}
            
            {taskSummary && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Task Progress:</h3>
                    <div className="p-3 bg-white border border-gray-300 rounded whitespace-pre-wrap">
                        {taskSummary}
                    </div>
                </div>
            )}
            
            {operations.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Operations List:</h3>
                    <div className="overflow-auto max-h-96 border border-gray-300 rounded">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">Description</th>
                                    <th className="py-2 px-4 border-b text-left">Type</th>
                                    <th className="py-2 px-4 border-b text-left">Status</th>
                                    <th className="py-2 px-4 border-b text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {operations.map((op) => (
                                    <tr key={op.id} className={op.completed ? 'bg-green-50' : ''}>
                                        <td className="py-2 px-4 border-b">{op.description}</td>
                                        <td className="py-2 px-4 border-b">{op.type}</td>
                                        <td className="py-2 px-4 border-b">
                                            {op.completed ? (
                                                <span className="text-green-600">Completed</span>
                                            ) : (
                                                <span className="text-orange-500">Pending</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            {!op.completed && (
                                                <button
                                                    onClick={() => handleOperationComplete(op.id)}
                                                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-400"
                                                    disabled={isProcessing}
                                                >
                                                    Mark as Completed
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}; 