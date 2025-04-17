import { ipcRenderer } from 'electron';

/**
 * Image processing related APIs
 */
export const imageApi = {
    /**
     * Convert image file to base64 encoding
     * @param filePath Path to the image file
     * @returns Object containing base64 encoding or error message
     */
    convertImageToBase64: async (filePath: string) => {
        return await ipcRenderer.invoke('convert-image-to-base64', filePath);
    },
    
    /**
     * Capture current screen and return base64 encoded image
     * @returns Object containing base64 encoding or error message
     */
    captureScreenshot: async () => {
        return await ipcRenderer.invoke('capture-screenshot');
    }
}; 