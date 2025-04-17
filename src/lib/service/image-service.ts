import fs from 'fs';
import { ipcMain } from 'electron';
import { captureScreen } from './automation-service';

/**
 * Image Service Class
 * Provides screen capture and image processing functionality
 */
class ImageService {
    /**
     * Capture screenshot and return image buffer
     * @returns Screenshot buffer and file path
     */
    static async captureScreenshot(): Promise<{
        buffer: Buffer;
        path: string;
    }> {
        try {
            // Get screen capture
            const screenshotPath = await captureScreen();
            
            // Read image file
            const imageBuffer = fs.readFileSync(screenshotPath);
            
            return {
                buffer: imageBuffer,
                path: screenshotPath
            };
        } catch (error) {
            console.error('Failed to capture or read image:', error);
            throw error;
        }
    }
    
    /**
     * Clean up temporary files
     * @param filePath File path
     */
    static cleanupTempFile(filePath: string): void {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.warn('Failed to clean up temp file:', error);
        }
    }
    
    /**
     * Convert image to base64 encoding
     * @param buffer Image buffer
     * @returns Base64 encoded string
     */
    static imageToBase64(buffer: Buffer): string {
        return buffer.toString('base64');
    }
}

/**
 * Set up image processing IPC handlers
 */
export const setupImageHandlers = () => {
    // Handle image to base64 conversion
    ipcMain.handle('convert-image-to-base64', async (_event, filePath: string) => {
        try {
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return { 
                    success: false, 
                    error: `File does not exist: ${filePath}` 
                };
            }
            
            // Read file
            const imageBuffer = fs.readFileSync(filePath);
            
            // Use ImageService to convert to base64
            const base64Data = ImageService.imageToBase64(imageBuffer);
            
            return {
                success: true,
                base64Data
            };
        } catch (error) {
            console.error('Error converting image to base64:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to convert image'
            };
        }
    });
    
    // Capture screen and return base64 encoded image
    ipcMain.handle('capture-screenshot', async () => {
        try {
            // Use ImageService to get screenshot
            const { buffer, path } = await ImageService.captureScreenshot();
            
            // Convert to base64
            const base64Data = ImageService.imageToBase64(buffer);
            
            // Clean up temp file
            ImageService.cleanupTempFile(path);
            
            return {
                success: true,
                base64Data
            };
        } catch (error) {
            console.error('Failed to capture screen:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to capture screen'
            };
        }
    });
};

// Export ImageService class for use in other files
export { ImageService }; 