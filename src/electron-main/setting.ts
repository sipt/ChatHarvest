import { BrowserWindow, app, dialog, ipcMain, nativeTheme } from "electron";
import path from "path";

let settingWindow: BrowserWindow | null = null;
let initParams: any = null;

export function createSettingWindow(selectTab?: string) {
  if (settingWindow) {
    settingWindow.focus();
    if (selectTab) {
      initParams = { selectTab };
      settingWindow.webContents.send("settings.tabs.change", selectTab);
    }
    return;
  }
  settingWindow = new BrowserWindow({
    width: 650,
    height: 550,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
      devTools: !app.isPackaged,
      webSecurity: false,
    },
    vibrancy: "sidebar",
    titleBarStyle: "hidden",
    resizable: false,
    minimizable: false,
  });
  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    settingWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + "/setting.html");
  } else {
    settingWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/setting.html`),
    );
  }
  if (!app.isPackaged) {
    // Open the DevTools.
    settingWindow.webContents.openDevTools();
  }

  settingWindow.on("closed", () => {
    settingWindow = null;
    initParams = null;
  });
  settingWindow.webContents.on("before-input-event", (event, input) => {
    // 检查是否按下了 F5 或者 CTRL+R (Cmd+R on Mac)
    if (
      input.key === "F5" ||
      ((input.control || input.meta) && input.key.toUpperCase() === "R")
    ) {
      event.preventDefault(); // 阻止事件默认行为
    }
  });

  nativeTheme.on("updated", () => {
    let theme = "light";
    if (nativeTheme.shouldUseDarkColors) {
      theme = "dark";
    }
    settingWindow.webContents.send("theme.updated", theme);
  });

  if (selectTab) {
    initParams = { selectTab };
    settingWindow.webContents.on("did-finish-load", () => {
      settingWindow.webContents.send("settings.tabs.change", selectTab);
    });
  }
}

ipcMain.on("settings.init-params.request", (event, arg) => {
  event.sender.send("settings.init-params.response", initParams);
});

ipcMain.on("settings.window.show", (event, arg) => {
  createSettingWindow(arg);
});

ipcMain.on("settings.alert", (event, type, title, message: string) => {
  message.length > 1000 && (message = message.slice(0, 500) + "...");
  dialog.showMessageBox(settingWindow, {
    type,
    title,
    message,
  });
});
