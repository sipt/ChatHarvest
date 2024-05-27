import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  nativeTheme,
  session,
} from "electron";
import path from "path";
import { createSettingWindow } from "./electron-main/setting";
import log from "electron-log/main";
// import { updateElectronApp, UpdateSourceType } from "update-electron-app";
import { readFileSync, writeFileSync } from "fs";

// Optional, initialize the logger for any renderer process
log.initialize({ preload: true });
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

// updateElectronApp({
//   updateSource: {
//     type: UpdateSourceType.StaticStorage,
//     baseUrl: `https://apps.sipt.top/bubble/releases/${process.platform}/${process.arch}`,
//   },
//   updateInterval: "1 hour",
//   notifyUser: true,
//   logger: log,
// });

const isMacOS = process.platform === "darwin";
const isWindows = process.platform === "win32";
app.commandLine.appendSwitch("use-angle", "opengl");

const createWindow = () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = "";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 450,
    minWidth: 750,
    // vibrancy: "sidebar",
    vibrancy: "sidebar", // in my case...
    visualEffectState: "followWindow", // in my case...
    titleBarStyle: isMacOS ? "hiddenInset" : isWindows ? "hidden" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: !app.isPackaged,
      webSecurity: false,
    },
    trafficLightPosition: { x: 12, y: 17 },
  });

  if (isWindows) {
    globalShortcut.register("CommandOrControl+N", () => {
      mainWindow.webContents.send("chat.create");
    });
  }
  const menu = Menu.buildFromTemplate([
    {
      role: "appMenu",
      submenu: [
        { role: "about" },
        { type: "separator" },
        {
          label: "Settings",
          accelerator: "CmdOrCtrl+,",
          click: () => {
            createSettingWindow();
            // 在这里添加打开设置窗口的代码
          },
        },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      role: "fileMenu",
      submenu: [
        {
          label: "New Chat",
          accelerator: "CmdOrCtrl+N",
          click: async () => {
            // 通知 render 进行创建
            mainWindow.webContents.send("chat.create");
          },
        },
        { type: "separator" },
        { role: "close" },
      ],
    },
    { role: "editMenu" },
    {
      label: "View",
      submenu: [
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    { role: "windowMenu" },
    {
      role: "help",
      submenu: [
        {
          label: "Contact Support",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://www.example.com/contact/");
          },
        },
      ],
    },
  ]);
  // 重新设置应用程序的菜单
  Menu.setApplicationMenu(menu);

  if (isWindows) {
    // mainWindow.setMenuBarVisibility(false);
    // mainWindow.setBackgroundMaterial("acrylic");
  }

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
  // set nodeIntegration
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("nodeIntegration", true);
  });

  mainWindow.webContents.on("before-input-event", (event, input) => {
    // 检查是否按下了 F5 或者 CTRL+R (Cmd+R on Mac)
    if (
      input.key === "F5" ||
      ((input.control || input.meta) && input.key.toUpperCase() === "R")
    ) {
      event.preventDefault(); // 阻止事件默认行为
    }
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    // 阻止默认行为，即阻止加载新页面的行为
    event.preventDefault();
  });

  nativeTheme.on("updated", () => {
    let theme = "light";
    if (nativeTheme.shouldUseDarkColors) {
      theme = "dark";
    }
    mainWindow.webContents.send("theme.updated", theme);
  });

  if (!app.isPackaged) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("close", () => {
    app.quit();
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.setAboutPanelOptions({
  applicationName: app.getName(),
  applicationVersion: app.getVersion(),
  copyright: "Copyright © 2023 sipt.top",
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
// Configure the default for all requests:
ipcMain.on("theme.select", (event, theme) => {
  nativeTheme.themeSource = theme;
});
ipcMain.on("imageOpen", async (event, arg) => {
  const resp = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Images", extensions: ["jpg", "png", "gif", "jpeg", "webp"] },
    ],
  });
  if (resp.canceled) {
    event.sender.send("imageOpen.response", null);
  } else {
    let list = [];
    for (let i = 0; i < resp.filePaths.length; i++) {
      const content = readFileSync(resp.filePaths[i], { encoding: "base64" });
      if (content.length > 1024 * 1024 * 2) {
        dialog.showMessageBox({
          type: "error",
          title: "Image size limit",
          message: "Image size limit 2M",
        });
        break;
      }
      // get file ext name from file path
      const ext = path
        .extname(resp.filePaths[i])
        .split(".")
        .pop()
        .toLowerCase();
      // make base64 prefix
      list.push({
        url: resp.filePaths[i],
        content: `data:image/${ext};base64,${content}`,
      });
    }
    event.sender.send("imageOpen.response", list);
  }
});
ipcMain.on("window.minimize", () => {
  BrowserWindow.getFocusedWindow().minimize();
});
ipcMain.on("window.maximize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});
ipcMain.on("window.close", () => {
  BrowserWindow.getFocusedWindow().close();
});
ipcMain.on("window.about.open", () => {
  app.showAboutPanel();
});
ipcMain.on("export", (event, name, chats) => {
  dialog
    .showSaveDialog({
      title: "Export",
      defaultPath: `${name}_chats.txt`,
      filters: [{ name: "TXT", extensions: ["txt"] }],
    })
    .then((result) => {
      if (result.canceled) return;
      if (chats) {
        const content = chats.join("\n");
        writeFileSync(result.filePath, content);
      }
    });
});
