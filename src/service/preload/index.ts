import { notificationApi } from './notification-api'
import { windowApi } from './window-api'
import { urlSafetyApi } from './url-safety-api'
import { httpApi } from './http-api'
import { browserMonitorApi } from './browser-monitor-api'
import { newsApi } from './news-api'
// import { autoReplyApi } from './auto-reply-api'

export const electronAPI = {
  ...notificationApi,
  ...windowApi,
  ...urlSafetyApi,
  ...browserMonitorApi,
  ...newsApi,
  // ...autoReplyApi,

  // Map browser monitor API to expected naming convention
  startBrowserMonitoring: browserMonitorApi.startMonitoring,
  stopBrowserMonitoring: browserMonitorApi.stopMonitoring,
  getBrowserMonitoringStatus: browserMonitorApi.getStatus,
  onBrowserData: browserMonitorApi.onBrowserData,
  onUnsafeUrlDetected: browserMonitorApi.onUnsafeUrl,
  onTokenSafetyDetected: browserMonitorApi.onTokenSafety,

  onNewsData: newsApi.onNewsData,

  http: httpApi,
}
