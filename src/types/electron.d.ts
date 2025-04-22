import { UrlSafetyResult } from '@/lib/preload/url-safety-api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  status?: number
  error?: string
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

interface HttpAPI {
  request: <T = any>(
    method: HttpMethod,
    url: string,
    data?: any,
    headers?: Record<string, string>,
    params?: Record<string, any>,
  ) => Promise<ApiResponse<T>>
  get: <T = any>(url: string, params?: Record<string, any>, headers?: Record<string, string>) => Promise<ApiResponse<T>>
  post: <T = any>(url: string, data?: any, headers?: Record<string, string>) => Promise<ApiResponse<T>>
  put: <T = any>(url: string, data?: any, headers?: Record<string, string>) => Promise<ApiResponse<T>>
  delete: <T = any>(
    url: string,
    params?: Record<string, any>,
    headers?: Record<string, string>,
  ) => Promise<ApiResponse<T>>
  patch: <T = any>(url: string, data?: any, headers?: Record<string, string>) => Promise<ApiResponse<T>>
}

interface ElectronAPI {
  // Notification related
  sendNotification: (title: string, body: string, route: string) => void
  onNotificationClick: (callback: (route: string) => void) => void
  removeNotificationListeners: () => void

  // Multi-window management
  createWindow: (options: { name: string; width?: number; height?: number; url?: string }) => Promise<number>
  onWindowId: (callback: (windowId: string) => void) => () => void
  getAllWindows: () => Promise<string[]>
  sendMessageToWindow: (windowId: string, channel: string, data: any) => void
  sendToWindow: (options: { windowId: number; channel: string; data: any }) => void
  onWindowMessage: (channel: string, callback: (data: any) => void) => () => void
  getWindowType: () => Promise<string>
  toggleIgnoreMouseEvents: (options: { ignore: boolean; windowId: string; forward: boolean }) => void
  moveWindow: (options: { windowId: string; x: number; y: number }) => void

  // Live2D window
  createLive2DWindow: (options: { width?: number; height?: number; hash?: string }) => Promise<number>
  setWindowPosition: (options: { windowId: string; x: number; y: number }) => void
  getWindowPosition: (windowId: string) => Promise<{ x: number; y: number }>

  // Automation related
  startAutomation: (options: any) => Promise<any>
  stopAutomation: () => Promise<any>
  getAutomationStatus: () => Promise<any>
  executeGuiAction: (action: string) => Promise<{ success: boolean; message: string }>
  processGuiAction: (
    task: string,
    systemPrompt: string,
    actionHistory?: string[],
  ) => Promise<{ success: boolean; thought?: string; action?: string; error?: string }>

  // Vision analysis related
  analyzeScreenshot: (options?: any) => Promise<any>
  findElementByImage: (options: any) => Promise<any>
  setAIModelConfig: (config: {
    provider: string
    apiKey: string
    baseURL?: string
    modelName?: string
  }) => Promise<{ success: boolean; error?: string }>
  setOpenAIConfig: (config: { apiKey: string; baseURL?: string }) => Promise<{ success: boolean; error?: string }>

  // New Vision Instruction API
  analyzeVisionInstruction: (options: { instruction: string }) => Promise<any>
  analyzeImageInstruction: (options: { base64Image: string; instruction: string }) => Promise<any>

  // Legacy API (Vision and automation)
  processInstruction: (instruction: string) => Promise<any>
  captureScreen: () => Promise<any>
  moveMouse: (x: number, y: number) => Promise<any>
  clickMouse: (x: number, y: number, doubleClick?: boolean) => Promise<any>
  typeText: (text: string) => Promise<any>
  pressKey: (keyName: string) => Promise<any>
  convertImageToBase64: (filePath: string) => Promise<any>

  // Image conversion
  captureScreenshot: () => Promise<string>

  // Browser Monitor API
  startBrowserMonitoring: () => Promise<{ success: boolean; message: string }>
  stopBrowserMonitoring: () => Promise<{ success: boolean; message: string }>
  getBrowserMonitoringStatus: () => Promise<{ isRunning: boolean }>
  onBrowserData: (callback: (data: any) => void) => () => void

  // URL Safety API
  checkUrlSafety: (url: string) => Promise<{ safe: boolean; reason?: string }>
  clearUrlSafetyCache: () => Promise<{ success: boolean; message?: string; error?: string }>

  // Phishing detection
  onUnsafeUrlDetected: (callback: (result: UrlSafetyResult) => void) => () => void

  // HTTP API (as namespace)
  http: HttpAPI
}

// Extend Window interface globally
declare global {
  type PixiApp = any

  interface Window {
    electronAPI: ElectronAPI
    model?: Live2DModel // Live2D model object
  }
}

export {}
