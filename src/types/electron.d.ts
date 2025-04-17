// Define ElectronAPI interface in global scope
interface ElectronAPI {
    // Notification related
    sendNotification: (options: { title: string; body: string; route?: string }) => void;
    onNotificationClick: (callback: (route: string) => void) => void;
    removeNotificationListeners: () => void;

    // Multi-window management
    createWindow: (options: { name: string; width?: number; height?: number; url?: string }) => Promise<number>;
    onWindowId: (callback: (windowId: string) => void) => () => void;
    getAllWindows: () => Promise<string[]>;
    sendMessageToWindow: (windowId: string, channel: string, data: any) => void;
    sendToWindow: (options: { windowId: number; channel: string; data: any }) => void;
    onWindowMessage: (channel: string, callback: (data: any) => void) => () => void;
    getWindowType: () => Promise<string>;
    
    // Live2D window
    createLive2DWindow: (options: { width: number; height: number; hash?: string }) => Promise<number>;
    setWindowPosition: (options: { windowId: number; x: number; y: number }) => void;

    // Automation related
    startAutomation: (options: any) => Promise<any>;
    stopAutomation: () => Promise<any>;
    getAutomationStatus: () => Promise<any>;
    executeGuiAction: (action: string) => Promise<{ success: boolean; message: string }>;
    processGuiAction: (task: string, systemPrompt: string, actionHistory?: string[]) => Promise<{ success: boolean; thought?: string; action?: string; error?: string }>;

    // Vision analysis related
    analyzeScreenshot: (options?: any) => Promise<any>;
    findElementByImage: (options: any) => Promise<any>;
    setAIModelConfig: (config: { provider: string; apiKey: string; baseURL?: string; modelName?: string }) => Promise<{ success: boolean; error?: string }>;
    setOpenAIConfig: (config: { apiKey: string; baseURL?: string }) => Promise<{ success: boolean; error?: string }>;
    
    // Legacy API (Vision and automation)
    processInstruction: (instruction: string) => Promise<any>;
    captureScreen: () => Promise<any>;
    moveMouse: (x: number, y: number) => Promise<any>;
    clickMouse: (x: number, y: number, doubleClick?: boolean) => Promise<any>;
    typeText: (text: string) => Promise<any>;
    pressKey: (keyName: string) => Promise<any>;
    convertImageToBase64: (filePath: string) => Promise<any>;

    // Image conversion
    captureScreenshot: () => Promise<string>;

    // Browser Monitor API
    startBrowserMonitoring: () => Promise<{ success: boolean; message: string }>;
    stopBrowserMonitoring: () => Promise<{ success: boolean; message: string }>;
    getBrowserMonitoringStatus: () => Promise<{ isRunning: boolean }>;
    onBrowserData: (callback: (data: any) => void) => () => void;

    // URL Safety API
    checkUrlSafety: (url: string) => Promise<{
        url: string;
        isSafe: boolean;
        riskScore?: number;
        category?: string;
        reason?: string;
        timestamp: number;
    }>;
    clearUrlSafetyCache: () => Promise<{ success: boolean; message?: string; error?: string }>;

    // Phishing detection
    onUnsafeUrlDetected: (callback: (result: any) => void) => () => void;
}

// Extend Window interface globally
declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export { };