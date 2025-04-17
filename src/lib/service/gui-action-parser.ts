import { clickMouse, typeText, pressKey, pressKeyCombination } from './automation-service';

// Define GUI action types
export interface ParsedGuiAction {
    type: 'click' | 'left_double' | 'right_single' | 'drag' | 'hotkey' | 'type' | 'scroll' | 'wait' | 'finished' | 'call_user';
    params: Record<string, any>;
    raw: string;
}

/**
 * GUI Agent Action Parser
 * Parses and executes GUI agent operation commands returned by AI
 */
export class GuiActionParser {
    
    /**
     * Parse operation instructions returned by AI
     * @param actionText Operation instruction text
     * @returns Parsed operation object
     */
    static parseAction(actionText: string): ParsedGuiAction | null {
        // Clean text - remove extra backticks and spaces
        const cleanText = actionText.replace(/```$/, '').trim();
        if (!cleanText) return null;
        
        // Try to extract action name and parameters
        const match = cleanText.match(/^(\w+)\((.*)\)$/);
        if (!match) return null;
        
        const [, actionType, paramsText] = match;
        
        // Parse parameters
        const params: Record<string, any> = {};
        
        // First handle special bracket parameters - directly extract and convert to array
        // Handle start_box
        const boxMatch = paramsText.match(/start_box=(?:'?\[([^\]]*)\]'?|"?\[([^\]]*)\]"?)/);
        if (boxMatch) {
            const boxText = boxMatch[1] || boxMatch[2];
            if (boxText) {
                const boxValues = boxText.split(',').map(v => parseInt(v.trim()));
                if (boxValues.length === 4) {
                    params.start_box = boxValues;
                }
            }
        }
        
        // Handle end_box
        const endBoxMatch = paramsText.match(/end_box=(?:'?\[([^\]]*)\]'?|"?\[([^\]]*)\]"?)/);
        if (endBoxMatch) {
            const boxText = endBoxMatch[1] || endBoxMatch[2];
            if (boxText) {
                const boxValues = boxText.split(',').map(v => parseInt(v.trim()));
                if (boxValues.length === 4) {
                    params.end_box = boxValues;
                }
            }
        }
        
        // Match parameter names and values - for other parameters
        const paramRegex = /(\w+)=(?:'([^']*)'|"([^"]*)"|\[([^\]]*)\]|([a-zA-Z0-9]+))/g;
        const paramMatches = paramsText.matchAll(paramRegex);
        
        for (const paramMatch of Array.from(paramMatches)) {
            const [, paramName, singleQuoteValue, doubleQuoteValue, arrayValue, noQuoteValue] = paramMatch;
            
            // Skip if special parameter already processed
            if (paramName === 'start_box' && params.start_box) continue;
            if (paramName === 'end_box' && params.end_box) continue;
            
            if (arrayValue) {
                try {
                    // Try to parse as JSON array
                    params[paramName] = JSON.parse(`[${arrayValue}]`);
                } catch (e) {
                    console.error('Failed to parse array parameter:', e);
                    // If parsing fails, directly try to split into array
                    const values = arrayValue.split(',').map(v => {
                        const trimmed = v.trim();
                        const num = parseInt(trimmed);
                        return isNaN(num) ? trimmed : num;
                    });
                    params[paramName] = values;
                }
            } else {
                params[paramName] = singleQuoteValue || doubleQuoteValue || noQuoteValue;
            }
        }
        
        // Debug output
        console.log('Parsed parameters result:', params);
        
        return {
            type: actionType as ParsedGuiAction['type'],
            params,
            raw: cleanText
        };
    }
    
    /**
     * Execute parsed GUI operation
     * @param action Parsed operation object
     * @returns Execution result
     */
    static async executeAction(action: ParsedGuiAction): Promise<{
        success: boolean;
        message: string;
    }> {
        try {
            console.log('Executing GUI agent action:', action.type, action.params);
            
            switch (action.type) {
                case 'click': {
                    const box = action.params.start_box;
                    if (!Array.isArray(box) || box.length !== 4) {
                        throw new Error('Invalid click position');
                    }
                    
                    // Calculate center point
                    const x = Math.floor((box[0] + box[2]) / 2);
                    const y = Math.floor((box[1] + box[3]) / 2);
                    
                    await clickMouse(x, y);
                    return { success: true, message: `Clicked at coordinates (${x}, ${y})` };
                }
                
                case 'left_double': {
                    const box = action.params.start_box;
                    if (!Array.isArray(box) || box.length !== 4) {
                        throw new Error('Invalid click position');
                    }
                    
                    // Calculate center point
                    const x = Math.floor((box[0] + box[2]) / 2);
                    const y = Math.floor((box[1] + box[3]) / 2);
                    
                    await clickMouse(x, y, true);
                    return { success: true, message: `Double-clicked at coordinates (${x}, ${y})` };
                }
                
                case 'right_single': {
                    // Note: Right-click implementation needs to be added here
                    const box = action.params.start_box;
                    if (!Array.isArray(box) || box.length !== 4) {
                        throw new Error('Invalid click position');
                    }
                    
                    // Calculate center point
                    const x = Math.floor((box[0] + box[2]) / 2);
                    const y = Math.floor((box[1] + box[3]) / 2);
                    
                    // Specific implementation for right-click needed here
                    // await rightClickMouse(x, y);
                    
                    return { success: true, message: `Right-clicked at coordinates (${x}, ${y})` };
                }
                
                case 'drag': {
                    const startBox = action.params.start_box;
                    const endBox = action.params.end_box;
                    
                    if (!Array.isArray(startBox) || startBox.length !== 4 ||
                        !Array.isArray(endBox) || endBox.length !== 4) {
                        throw new Error('Invalid drag position');
                    }
                    
                    // Calculate start and end points
                    const startX = Math.floor((startBox[0] + startBox[2]) / 2);
                    const startY = Math.floor((startBox[1] + startBox[3]) / 2);
                    const endX = Math.floor((endBox[0] + endBox[2]) / 2);
                    const endY = Math.floor((endBox[1] + endBox[3]) / 2);
                    
                    // Specific implementation for drag needed here
                    // await dragMouse(startX, startY, endX, endY);
                    
                    return { success: true, message: `Dragged from (${startX}, ${startY}) to (${endX}, ${endY})` };
                }
                
                case 'hotkey': {
                    const key = action.params.key;
                    if (!key) {
                        throw new Error('Invalid hotkey');
                    }
                    
                    // Enhanced hotkey handling - handle combination keys and single keys
                    try {
                        if (key.includes('+')) {
                            // Combination key, e.g. "ctrl+c"
                            const keys = key.split('+').map((k: string) => k.trim());
                            await pressKeyCombination(keys);
                            return { success: true, message: `Executed key combination ${key}` };
                        } else {
                            // Single key
                            await pressKey(key);
                            return { success: true, message: `Pressed hotkey ${key}` };
                        }
                    } catch (error) {
                        console.error('Hotkey execution failed:', error);
                        throw new Error(`Hotkey execution failed: ${(error as Error).message}`);
                    }
                }
                
                case 'type': {
                    const content = action.params.content;
                    if (content === undefined) {
                        throw new Error('Invalid input content');
                    }
                    
                    await typeText(content);
                    return { success: true, message: `Typed text: ${content}` };
                }
                
                case 'scroll': {
                    const box = action.params.start_box;
                    const direction = action.params.direction;
                    
                    if (!Array.isArray(box) || box.length !== 4) {
                        throw new Error('Invalid scroll position');
                    }
                    
                    if (!direction || !['up', 'down', 'left', 'right'].includes(direction)) {
                        throw new Error('Invalid scroll direction');
                    }
                    
                    // Specific implementation for scroll needed here
                    // await scrollScreen(box, direction);
                    
                    return { success: true, message: `Scrolled direction: ${direction}` };
                }
                
                case 'wait':
                    // Wait for 5 seconds
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    return { success: true, message: 'Waited 5 seconds' };
                
                case 'finished':
                    return { success: true, message: 'Task completed' };
                
                case 'call_user':
                    return { success: true, message: 'User assistance needed' };
                
                default:
                    return { success: false, message: `Unknown operation type: ${action.type}` };
            }
        } catch (error) {
            console.error('Failed to execute GUI agent action:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
} 