import React from 'react';

interface InstructionInputProps {
    instruction: string;
    onInstructionChange: (value: string) => void;
    submitInstruction: () => void;
    loading: boolean;
    disabled: boolean;
}

export function InstructionInput({
    instruction,
    onInstructionChange,
    submitInstruction,
    loading,
    disabled
}: InstructionInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitInstruction();
        }
    };

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Enter Instruction</h3>
            <div className="flex flex-col mb-2">
                <textarea
                    value={instruction}
                    onChange={(e) => onInstructionChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter instruction for AI to execute, e.g. 'Click the settings button on the page'"
                    className="w-full p-2 border rounded-md min-h-24 mb-2"
                    disabled={loading || disabled}
                />
                <button
                    onClick={submitInstruction}
                    disabled={loading || disabled || !instruction.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                >
                    {loading ? 'Generating...' : 'Generate Action'}
                </button>
            </div>
        </div>
    );
} 