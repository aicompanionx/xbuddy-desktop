interface ElectronAPI {
    // Notification related
    sendNotification: (title: string, body: string, route: string) => void;
    onNotificationClick: (callback: (route: string) => void) => void;
    removeNotificationListeners: () => void;

    // Multi-window management
    createWindow: (options: {
        name: string,
        width?: number,
        height?: number,
        url?: string
    }) => Promise<number>;
    onWindowId: (callback: (windowId: string) => void) => () => void;
    getAllWindows: () => Promise<string[]>;
    sendMessageToWindow: (windowId: string, channel: string, data: any) => void;
    onWindowMessage: (channel: string, callback: (data: any) => void) => () => void;
    getWindowType: () => Promise<string>;
    
    // Live2D window
    createLive2DWindow: (options: {
        width?: number,
        height?: number,
        hash?: string
    }) => Promise<number>;

    // Automation related
    captureScreen: () => Promise<{ success: boolean; path?: string; error?: string }>;
    moveMouse: (x: number, y: number) => Promise<{ success: boolean; error?: string }>;
    clickMouse: (x: number, y: number, doubleClick?: boolean) => Promise<{ success: boolean; error?: string }>;
    typeText: (text: string) => Promise<{ success: boolean; error?: string }>;
    pressKey: (keyName: string) => Promise<{ success: boolean; error?: string }>;

    // Vision analysis related
    setAIModelConfig: (config: {
        provider: 'openai' | 'huggingface';
        apiKey: string;
        baseURL?: string;
        modelName?: string;
    }) => Promise<{ success: boolean; error?: string }>;
    analyzeScreenshot: (prompt?: string) => Promise<{ success: boolean; result?: string; error?: string }>;
    processInstruction: (instruction: string) => Promise<{
        success: boolean;
        result?: string;
        error?: string;
        actions?: Array<{
            type: string;
            x?: number;
            y?: number;
            doubleClick?: boolean;
            text?: string;
            keyName?: string;
            description?: string;
        }>;
    }>;
    
    // GUI agent related
    processGuiAction: (
        task: string,
        systemPrompt: string,
        actionHistory?: string[]
    ) => Promise<{
        success: boolean;
        thought?: string;
        action?: string;
        error?: string;
    }>;
    executeGuiAction: (actionText: string) => Promise<{
        success: boolean;
        message: string;
    }>;

    // Image conversion
    convertImageToBase64: (filePath: string) => Promise<{
        success: boolean;
        base64Data?: string;
        error?: string;
    }>;
}

interface Window {
    electronAPI: ElectronAPI;
}