"use strict";
const electron = require("electron");
const notificationApi = {
  // 发送通知
  sendNotification: (title, body, route) => {
    electron.ipcRenderer.send("send-notification", { title, body, route });
  },
  // 监听通知点击事件
  onNotificationClick: (callback) => {
    electron.ipcRenderer.on("notification-clicked", (_event, route) => callback(route));
  },
  // 移除通知点击监听器
  removeNotificationListeners: () => {
    electron.ipcRenderer.removeAllListeners("notification-clicked");
  }
};
const windowApi = {
  // 创建新窗口
  createWindow: async (options) => {
    return await electron.ipcRenderer.invoke("create-window", options);
  },
  // 获取当前窗口的 ID
  onWindowId: (callback) => {
    electron.ipcRenderer.on("window-id", (_event, windowId) => callback(windowId));
    return () => {
      electron.ipcRenderer.removeAllListeners("window-id");
    };
  },
  // 获取所有窗口列表
  getAllWindows: async () => {
    return await electron.ipcRenderer.invoke("get-all-windows");
  },
  // 向特定窗口发送消息
  sendMessageToWindow: (windowId, channel, data) => {
    electron.ipcRenderer.send("send-to-window", { windowId, channel, data });
  },
  // 监听从其他窗口发来的消息
  onWindowMessage: (channel, callback) => {
    const listener = (_event, data) => callback(data);
    electron.ipcRenderer.on(channel, listener);
    return () => {
      electron.ipcRenderer.removeListener(channel, listener);
    };
  }
};
const electronAPI = {
  ...notificationApi,
  ...windowApi
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
