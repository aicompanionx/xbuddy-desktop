"use strict";
const electron = require("electron");
const path = require("path");
let pendingRoute = null;
const createNotification = (title, body, route, mainWindow2) => {
  const notification = new electron.Notification({
    title,
    body,
    silent: false,
    icon: path.join(__dirname, "../../../assets/icon.png")
  });
  notification.addListener("click", () => {
    pendingRoute = route;
    if (mainWindow2) {
      if (mainWindow2.isMinimized()) {
        mainWindow2.restore();
      }
      mainWindow2.focus();
      mainWindow2.webContents.send("notification-clicked", route);
    }
  });
  notification.show();
};
const handlePendingRoute = (browserWindow, windowId) => {
  if (pendingRoute && windowId === "main") {
    browserWindow.webContents.send("notification-clicked", pendingRoute);
    pendingRoute = null;
  }
};
const windows = {};
let mainWindow = null;
const createWindow = (windowId = "main", width = 800, height = 600, url) => {
  const browserWindow = new electron.BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(electron.app.getAppPath(), ".vite", "build", "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    },
    title: `窗口 - ${windowId}`
  });
  windows[windowId] = browserWindow;
  if (windowId === "main") {
    mainWindow = browserWindow;
  }
  browserWindow.webContents.on("did-finish-load", () => {
    handlePendingRoute(browserWindow, windowId);
    browserWindow.webContents.send("window-id", windowId);
  });
  browserWindow.on("closed", () => {
    delete windows[windowId];
    if (windowId === "main") {
      mainWindow = null;
    }
  });
  if (process.env.NODE_ENV === "development") {
    browserWindow.loadURL("http://localhost:5173");
    browserWindow.webContents.openDevTools();
  } else {
    browserWindow.loadFile(path.join(__dirname, "../../../renderer/index.html"));
  }
  return browserWindow;
};
const createSecondaryWindow = (name) => {
  const id = `secondary-${name}-${Date.now()}`;
  return createWindow(id, 600, 500);
};
const createAppMenu = () => {
  const template = [
    {
      label: "窗口",
      submenu: [
        {
          label: "新建窗口",
          click: () => createSecondaryWindow("new")
        },
        { type: "separator" },
        {
          label: "显示所有窗口",
          click: () => {
            Object.values(windows).forEach((win) => {
              if (win.isMinimized()) win.restore();
              win.show();
            });
          }
        }
      ]
    }
  ];
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
};
const getAllWindowIds = () => {
  return Object.keys(windows);
};
const getWindowById = (windowId) => {
  return windows[windowId] || null;
};
const getMainWindow = () => {
  return mainWindow;
};
const setupIpcHandlers = () => {
  electron.ipcMain.on("send-notification", (_event, { title, body, route }) => {
    createNotification(title, body, route, getMainWindow());
  });
  electron.ipcMain.handle("create-window", (_event, { name }) => {
    const window = createSecondaryWindow(name);
    return window.id;
  });
  electron.ipcMain.handle("get-all-windows", () => {
    return getAllWindowIds();
  });
  electron.ipcMain.on("send-to-window", (_event, { windowId, channel, data }) => {
    const targetWindow = getWindowById(windowId);
    if (targetWindow) {
      targetWindow.webContents.send(channel, data);
    }
  });
};
if (require("electron-squirrel-startup")) {
  electron.app.quit();
}
electron.app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();
  createAppMenu();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
