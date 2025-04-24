import { UrlSafetyResult } from '@/service/preload/url-safety-api'
import { TokenSafetyProps } from '@/service/main/api/token-safety/types/token'
import { TwitterAccountInfo } from '@/service/main/api/token-safety/types/twitter'

import type { Live2DModel as Live2DModelType } from 'pixi-live2d-display/types';
import type { Application as ApplicationType } from 'pixi.js';
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    status?: number;
    error?: string;
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch'

interface HttpAPI {
  request: <T = unknown>(
    method: HttpMethod,
    url: string,
    data?: unknown,
    headers?: Record<string, string>,
    params?: Record<string, unknown>,
  ) => Promise<ApiResponse<T>>
  get: <T = unknown>(url: string, params?: Record<string, unknown>, headers?: Record<string, string>) => Promise<ApiResponse<T>>
  post: <T = unknown>(url: string, data?: unknown, headers?: Record<string, string>) => Promise<ApiResponse<T>>
  put: <T = unknown>(url: string, data?: unknown, headers?: Record<string, string>) => Promise<ApiResponse<T>>
  delete: <T = unknown>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string>,
  ) => Promise<ApiResponse<T>>
  patch: <T = unknown>(url: string, data?: unknown, headers?: Record<string, string>) => Promise<ApiResponse<T>>
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
  sendMessageToWindow: (windowId: string, channel: string, data: unknown) => void
  sendToWindow: (options: { windowId: number; channel: string; data: unknown }) => void
  onWindowMessage: (channel: string, callback: (data: unknown) => void) => () => void
  getWindowType: () => Promise<string>
  toggleIgnoreMouseEvents: (options: { ignore: boolean; windowId: string; forward: boolean }) => void
  moveWindow: (options: { windowId: string; x: number; y: number }) => void

  // Live2D window
  createLive2DWindow: (options: { width?: number; height?: number; hash?: string }) => Promise<number>
  setWindowPosition: (options: { windowId: string; x: number; y: number }) => void
  getWindowPosition: (windowId: string) => Promise<{ x: number; y: number }>

  // Automation related
  startAutomation: (options: unknown) => Promise<unknown>
  stopAutomation: () => Promise<unknown>
  getAutomationStatus: () => Promise<unknown>
  executeGuiAction: (action: string) => Promise<{ success: boolean; message: string }>
  processGuiAction: (
    task: string,
    systemPrompt: string,
    actionHistory?: string[],
  ) => Promise<{ success: boolean; thought?: string; action?: string; error?: string }>

  // Vision analysis related
  analyzeScreenshot: (options?: unknown) => Promise<unknown>
  findElementByImage: (options: unknown) => Promise<unknown>
  setAIModelConfig: (config: {
    provider: string
    apiKey: string
    baseURL?: string
    modelName?: string
  }) => Promise<{ success: boolean; error?: string }>
  setOpenAIConfig: (config: { apiKey: string; baseURL?: string }) => Promise<{ success: boolean; error?: string }>

  // New Vision Instruction API
  analyzeVisionInstruction: (options: { instruction: string }) => Promise<unknown>
  analyzeImageInstruction: (options: { base64Image: string; instruction: string }) => Promise<unknown>

  // Legacy API (Vision and automation)
  processInstruction: (instruction: string) => Promise<unknown>
  captureScreen: () => Promise<unknown>
  moveMouse: (x: number, y: number) => Promise<unknown>
  clickMouse: (x: number, y: number, doubleClick?: boolean) => Promise<unknown>
  typeText: (text: string) => Promise<unknown>
  pressKey: (keyName: string) => Promise<unknown>
  convertImageToBase64: (filePath: string) => Promise<unknown>

  // Image conversion
  captureScreenshot: () => Promise<string>

  // Browser Monitor API
  startBrowserMonitoring: () => Promise<{ success: boolean; message: string }>
  stopBrowserMonitoring: () => Promise<{ success: boolean; message: string }>
  getBrowserMonitoringStatus: () => Promise<{ isRunning: boolean }>
  onBrowserData: (callback: (data: unknown) => void) => () => void

  // URL Safety API
  checkUrlSafety: (url: string) => Promise<{ safe: boolean; reason?: string }>
  clearUrlSafetyCache: () => Promise<{ success: boolean; message?: string; error?: string }>

  // Phishing detection
  onUnsafeUrlDetected: (callback: (result: UrlSafetyResult) => void) => () => void

  // Token Safety API
  onTokenSafetyDetected: (callback: (result: TokenSafetyProps) => void) => () => void

  // Twitter account detection
  onTwitterAccountDetected: (callback: (result: TwitterAccountInfo) => void) => () => void

  // HTTP API (as namespace)
  http: HttpAPI
}

interface SpeakOptions {
  volume?: number,
  resetExpression?: boolean,
  expression?: number,
  onFinish?: () => void,
  onError?: <T>(err: T) => void,
}

// Extend Window interface globally
declare global {


    type Application = ApplicationType;

    type Live2DModel = Live2DModelType & {
      speak(audioUrl: string, options: SpeakOptions): void;
        stopMotions(): void;
    };

    interface Live2DModelStatic {
        from(modelPath: string): Promise<Live2DModel>;
    }

    interface Window {
        electronAPI: ElectronAPI;

        PIXI: {
            Application: ApplicationType & {
                new(options: unknown): ApplicationType;
            };
            live2d: {
                Live2DModel: Live2DModelStatic
            };
        };
    }
}
