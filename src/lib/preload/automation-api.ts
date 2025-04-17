import { ipcRenderer } from 'electron';

/**
 * Automation related APIs
 */
export const automationApi = {
    // Capture screen
    captureScreen: async (): Promise<{ success: boolean; path?: string; error?: string }> => {
        return await ipcRenderer.invoke('capture-screen');
    },

    // Move mouse to specified position
    moveMouse: async (x: number, y: number): Promise<{ success: boolean; error?: string }> => {
        return await ipcRenderer.invoke('move-mouse', { x, y });
    },

    // Mouse click
    clickMouse: async (
        x: number,
        y: number,
        doubleClick = false
    ): Promise<{ success: boolean; error?: string }> => {
        return await ipcRenderer.invoke('click-mouse', { x, y, doubleClick });
    },

    // Type text via keyboard
    typeText: async (text: string): Promise<{ success: boolean; error?: string }> => {
        return await ipcRenderer.invoke('type-text', { text });
    },

    // Press specific key
    pressKey: async (keyName: string): Promise<{ success: boolean; error?: string }> => {
        return await ipcRenderer.invoke('press-key', { keyName });
    }
}; 