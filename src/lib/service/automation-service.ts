import { ipcMain, BrowserWindow, dialog, desktopCapturer } from 'electron';
import path from 'path';
import fs from 'fs';
import { getMainWindow } from './window-manager';

// Initialize variables
let useNutJs = true;
let mouse: any, keyboard: any, Key: any, Point: any;

// Import nut.js using try-catch block
try {
    // Use import statement
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nutjs = require('@nut-tree/nut-js');
    mouse = nutjs.mouse;
    keyboard = nutjs.keyboard;
    Key = nutjs.Key;
    Point = nutjs.Point;
    
    // Configure nut.js
    mouse.config.mouseSpeed = 1000;
    keyboard.config.autoDelayMs = 100;
} catch (error) {
    console.error('Failed to load nut.js library, will use fallback method:', error);
    useNutJs = false;
}

/**
 * Capture screen and save to temp file
 * @returns Screenshot file path
 */
export const captureScreen = async (): Promise<string> => {
    try {
        // Get all screen sources
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });
        
        // Get primary screen
        const primarySource = sources[0];
        if (!primarySource) {
            throw new Error('Unable to get screen source');
        }
        
        // Get thumbnail
        const thumbnail = primarySource.thumbnail;
        
        // Ensure temp directory exists
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Save screenshot to temp file
        const filePath = path.join(tempDir, `screenshot-${Date.now()}.png`);
        fs.writeFileSync(filePath, thumbnail.toPNG());
        
        return filePath;
    } catch (error) {
        console.error('Screenshot failed:', error);
        throw error;
    }
};

/**
 * Move mouse to specified position
 * @param x X coordinate
 * @param y Y coordinate
 */
export const moveMouseTo = async (x: number, y: number): Promise<void> => {
    try {
        if (useNutJs) {
            const target = new Point(x, y);
            await mouse.setPosition(target);
        } else {
            // Fallback mechanism, can use other ways to simulate mouse movement
            console.log('Simulating mouse movement to position:', x, y);
            // Need to implement actual mouse movement logic here, may require additional dependencies
        }
    } catch (error) {
        console.error('Mouse movement failed:', error);
        throw error;
    }
};

/**
 * Mouse click
 * @param x X coordinate, optional, uses current position if not provided
 * @param y Y coordinate, optional, uses current position if not provided
 * @param doubleClick Whether to double click, defaults to false
 */
export const clickMouse = async (x?: number, y?: number, doubleClick = false): Promise<void> => {
    try {
        // If coordinates provided, move to that position first
        if (x !== undefined && y !== undefined) {
            await moveMouseTo(x, y);
        }
        
        if (useNutJs) {
            // Execute click
            if (doubleClick) {
                await mouse.leftClick();
                await mouse.leftClick();
            } else {
                await mouse.leftClick();
            }
        } else {
            // Fallback mechanism, simulate mouse click
            console.log('Simulating mouse click:', {x, y, doubleClick});
            // Need to implement actual mouse click logic here
        }
    } catch (error) {
        console.error('Mouse click failed:', error);
        throw error;
    }
};

/**
 * Type text using keyboard
 * @param text Text to type
 */
export const typeText = async (text: string): Promise<void> => {
    try {
        if (useNutJs) {
            console.log('Using nut.js for keyboard input:', text);
            await keyboard.type(text);
        } else {
            // Fallback mechanism, simulate keyboard input
            console.log('Simulating keyboard input:', text);
            // Need to implement actual keyboard input logic here
        }
    } catch (error) {
        console.error('Keyboard input failed:', error);
        throw error;
    }
};

/**
 * Handle key combinations (e.g. Ctrl+C)
 * @param keys Array of key combinations
 */
export const pressKeyCombination = async (keys: string[]): Promise<void> => {
    try {
        if (useNutJs && Key) {
            // Convert key names to nut.js Key enum
            const keyObjects = keys.map(keyName => {
                // Handle common aliases
                let nutjsKeyName = keyName.toLowerCase();
                
                // Special key mapping table
                const keyMap: Record<string, string> = {
                    // Control key mappings
                    'ctrl': 'control',
                    'cmd': 'command',
                    'opt': 'option',
                    'alt': 'alt',
                    'win': 'windows',
                    'meta': 'command',
                    
                    // Arrow keys
                    'up': 'up',
                    'down': 'down',
                    'left': 'left',
                    'right': 'right',
                    'arrowup': 'up',
                    'arrowdown': 'down',
                    'arrowleft': 'left',
                    'arrowright': 'right',
                    
                    // Function keys
                    'esc': 'escape',
                    'escape': 'escape',
                    'enter': 'enter',
                    'return': 'enter',
                    'tab': 'tab',
                    'space': 'space',
                    'backspace': 'backspace',
                    'delete': 'delete',
                    'del': 'delete',
                    'ins': 'insert',
                    'insert': 'insert',
                    'home': 'home',
                    'end': 'end',
                    'pageup': 'pageup',
                    'pagedown': 'pagedown',
                    
                    // F keys
                    'f1': 'f1',
                    'f2': 'f2',
                    'f3': 'f3',
                    'f4': 'f4',
                    'f5': 'f5',
                    'f6': 'f6',
                    'f7': 'f7',
                    'f8': 'f8',
                    'f9': 'f9',
                    'f10': 'f10',
                    'f11': 'f11',
                    'f12': 'f12',
                    
                    // Other special keys
                    'prtsc': 'printscreen',
                    'printscreen': 'printscreen',
                    'scrolllock': 'scrolllock',
                    'pause': 'pause',
                    'capslock': 'capslock',
                    'numlock': 'numlock',
                };
                
                // If in mapping table, use mapped value
                if (keyMap[nutjsKeyName]) {
                    nutjsKeyName = keyMap[nutjsKeyName];
                }
                
                // If single character, may need special handling
                if (nutjsKeyName.length === 1) {
                    if (/[a-z]/.test(nutjsKeyName)) {
                        // Letters used directly
                        return Key[nutjsKeyName.toUpperCase() as keyof typeof Key];
                    } else if (/[0-9]/.test(nutjsKeyName)) {
                        // Numbers
                        return Key[`Num${nutjsKeyName}` as keyof typeof Key];
                    } else {
                        // Try to handle special symbols
                        switch (nutjsKeyName) {
                            case '+': return Key.Add;
                            case '-': return Key.Subtract;
                            case '*': return Key.Multiply;
                            case '/': return Key.Divide;
                            case '=': return Key.Equal;
                            case '.': return Key.Period;
                            case ',': return Key.Comma;
                            case ';': return Key.Semicolon;
                            case "'": return Key.Quote;
                            case '[': return Key.LeftBracket;
                            case ']': return Key.RightBracket;
                            case '\\': return Key.Backslash;
                            case '`': return Key.Backquote;
                        }
                    }
                }
                
                // Try to capitalize first letter to match Key enum
                const formattedKey = nutjsKeyName.charAt(0).toUpperCase() + nutjsKeyName.slice(1);
                const keyObject = Key[formattedKey as keyof typeof Key];
                
                if (!keyObject) {
                    console.warn(`Unrecognized key: ${keyName}, after conversion: ${formattedKey}`);
                }
                
                return keyObject;
            });
            
            // Filter out invalid keys
            const validKeys = keyObjects.filter(key => key !== undefined);
            
            if (validKeys.length > 0) {
                console.log(`Executing key combination: ${keys.join('+')}, recognized valid keys: ${validKeys.length}/${keys.length}`);
                
                // Press all keys
                for (const key of validKeys) {
                    await keyboard.pressKey(key);
                }
                
                // Brief delay
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Release all keys in reverse order
                for (let i = validKeys.length - 1; i >= 0; i--) {
                    await keyboard.releaseKey(validKeys[i]);
                }
            } else {
                console.warn('No valid key combinations, original keys:', keys);
                throw new Error(`Unrecognized key combination: ${keys.join('+')}`);
            }
        } else {
            // Fallback mechanism, simulate key combination
            console.log('Simulating key combination:', keys.join('+'));
            // Need to implement actual key combination logic here
            throw new Error('Cannot simulate key combinations in current environment');
        }
    } catch (error) {
        console.error('Key combination operation failed:', error);
        throw error;
    }
};

/**
 * Press specific key
 * @param keyName Key name
 */
export const pressKey = async (keyName: string): Promise<void> => {
    try {
        if (useNutJs && Key) {
            // First try to use key combination logic to recognize key, for better compatibility
            const keys = [keyName];
            const result = await pressKeyCombination(keys);
            return result;
        } else {
            // Fallback mechanism, simulate key press
            console.log('Simulating key press:', keyName);
            // Need to implement actual key press logic here
            throw new Error('Cannot simulate key press in current environment');
        }
    } catch (error) {
        console.error(`Key press operation failed (${keyName}):`, error);
        throw error;
    }
};

/**
 * Set up IPC handlers for automation service
 */
export const setupAutomationHandlers = () => {
    // Handle screenshot request
    ipcMain.handle('capture-screen', async () => {
        try {
            const screenshotPath = await captureScreen();
            return { success: true, path: screenshotPath };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });
    
    // Handle mouse movement request
    ipcMain.handle('move-mouse', async (_event, { x, y }) => {
        try {
            await moveMouseTo(x, y);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });
    
    // Handle mouse click request
    ipcMain.handle('click-mouse', async (_event, { x, y, doubleClick }) => {
        try {
            await clickMouse(x, y, doubleClick);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });
    
    // Handle keyboard input request
    ipcMain.handle('type-text', async (_event, { text }) => {
        try {
            await typeText(text);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });
    
    // Handle key press request
    ipcMain.handle('press-key', async (_event, { keyName }) => {
        try {
            await pressKey(keyName);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });
};