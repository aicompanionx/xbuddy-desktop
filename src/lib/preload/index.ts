import { notificationApi } from './notification-api';
import { windowApi } from './window-api';
import { automationApi } from './automation-api';
import { visionApi } from './vision-api';
import { imageApi } from './image-api';

/**
 * Complete API exposed to renderer process by preload script
 */
export const electronAPI = {
    ...notificationApi,
    ...windowApi,
    ...automationApi,
    ...visionApi,
    ...imageApi
};