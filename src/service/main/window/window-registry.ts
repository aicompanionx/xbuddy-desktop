import { BrowserWindow, screen } from 'electron';
import { WINDOWS_ID } from '@/constants/windowsId';

export interface WindowsRegistry {
    [key: string]: BrowserWindow;
}

const windows: WindowsRegistry = {};

let mainWindow: BrowserWindow | null = null;

/**
 * Register a window in the registry
 * @param windowId Window ID
 * @param window BrowserWindow instance
 */
export const registerWindow = (windowId: string, window: BrowserWindow): void => {
    windows[windowId] = window;

    // If this is the main window, set the global reference
    if (windowId === WINDOWS_ID.MAIN) {
        mainWindow = window;
    }

    // When window is closed, remove from registry
    window.on('closed', () => {
        delete windows[windowId];
        if (windowId === WINDOWS_ID.MAIN) {
            mainWindow = null;
        }
    });
};

/**
 * Get all window IDs
 * @returns Array of window IDs
 */
export const getAllWindowIds = () => {
    return Object.keys(windows);
};

/**
 * Get window by ID
 * @param windowId Window ID
 * @returns Window instance or null if not found
 */
export const getWindowById = (windowId: string): BrowserWindow | null => {
    return windows[windowId] || null;
};

/**
 * Get the main window
 * @returns Main window instance
 */
export const getMainWindow = (): BrowserWindow | null => {
    return mainWindow;
};

/**
 * Ensure position is within screen bounds
 * @param x X coordinate
 * @param y Y coordinate 
 * @param windowWidth Window width
 * @param windowHeight Window height
 * @returns Adjusted position coordinates
 */
export const ensurePositionInBounds = (
    x: number,
    y: number,
    windowWidth: number,
    windowHeight: number
): { x: number, y: number } => {
    // Get the primary display bounds
    const displayBounds = screen.getPrimaryDisplay().workArea;

    // Initialize adjusted position
    let adjustedX = x;
    let adjustedY = y;

    // Ensure window is not positioned off the left edge
    if (x < displayBounds.x) {
        adjustedX = displayBounds.x;
    }

    // Ensure window is not positioned off the top edge
    if (y < displayBounds.y) {
        adjustedY = displayBounds.y;
    }

    // Ensure window is not positioned off the right edge
    // Calculate max X position that keeps window visible
    const maxX = displayBounds.x + displayBounds.width - Math.min(100, windowWidth / 4);
    if (x > maxX) {
        adjustedX = maxX;
    }

    // Ensure window is not positioned off the bottom edge
    // Calculate max Y position that keeps window on screen
    const maxY = displayBounds.y + displayBounds.height - windowHeight;
    if (y > maxY) {
        adjustedY = maxY;
    }

    return { x: adjustedX, y: adjustedY };
};

/**
 * Set window position with bounds checking
 * @param windowId Window ID
 * @param x X coordinate
 * @param y Y coordinate
 * @returns Success status
 */
export const setWindowPosition = (windowId: string, x: number, y: number): boolean => {
    const window = getWindowById(windowId);
    if (window) {
        // Get window size
        const [width, height] = window.getSize();

        // Ensure position is within screen bounds
        const { x: adjustedX, y: adjustedY } = ensurePositionInBounds(x, y, width, height);

        // Set the adjusted position
        window.setPosition(Math.round(adjustedX), Math.round(adjustedY));
        return true;
    }
    return false;
}; 