import { useState } from 'react';

// Import type definitions
import type { ActionInstruction, VisionInstructionResult } from '@/lib/api/vision/types';

/**
 * Vision instruction state
 */
interface VisionInstructionState {
    loading: boolean;
    error: string | null;
    result: VisionInstructionResult | null;
}

/**
 * Vision Instruction Hook
 * 
 * Provides functionality to communicate with the Electron main process vision instruction service
 */
export const useVisionInstruction = () => {
    // State management
    const [state, setState] = useState<VisionInstructionState>({
        loading: false,
        error: null,
        result: null,
    });

    /**
     * Analyze current screen and execute instructions
     * 
     * @param instruction User instruction
     * @returns Analysis result Promise
     */
    const analyzeScreenInstruction = async (instruction: string): Promise<VisionInstructionResult> => {
        try {
            setState({ ...state, loading: true, error: null });

            // Call Electron API to communicate with main process
            const response = await window.electronAPI.analyzeVisionInstruction({ instruction });

            if (!response.success) {
                throw new Error(response.error || 'Unknown error');
            }

            // Update state
            setState({
                loading: false,
                error: null,
                result: response.result
            });

            return response.result;
        } catch (error) {
            const errorMessage = (error as Error).message;
            setState({
                loading: false,
                error: errorMessage,
                result: null
            });
            throw error;
        }
    };

    /**
     * Analyze and execute instructions using provided Base64 image
     * 
     * @param base64Image Base64 encoded image
     * @param instruction User instruction
     * @returns Analysis result Promise
     */
    const analyzeImageInstruction = async (
        base64Image: string,
        instruction: string
    ): Promise<VisionInstructionResult> => {
        try {
            setState({ ...state, loading: true, error: null });

            // Call Electron API to communicate with main process
            const response = await window.electronAPI.analyzeImageInstruction({
                base64Image,
                instruction
            });

            if (!response.success) {
                throw new Error(response.error || 'Unknown error');
            }

            // Update state
            setState({
                loading: false,
                error: null,
                result: response.result
            });

            return response.result;
        } catch (error) {
            const errorMessage = (error as Error).message;
            setState({
                loading: false,
                error: errorMessage,
                result: null
            });
            throw error;
        }
    };

    /**
     * Reset state
     */
    const reset = () => {
        setState({
            loading: false,
            error: null,
            result: null
        });
    };

    /**
     * Extract instruction list
     */
    const getInstructions = (): ActionInstruction[] => {
        return state.result?.instructions || [];
    };

    /**
     * Extract AI answer
     */
    const getAnswer = (): string => {
        return state.result?.answer || '';
    };

    return {
        // State
        isLoading: state.loading,
        error: state.error,
        result: state.result,

        // Action methods
        analyzeScreenInstruction,
        analyzeImageInstruction,
        reset,

        // Helper methods
        getInstructions,
        getAnswer
    };
}; 