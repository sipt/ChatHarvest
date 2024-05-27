// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
//
import { contextBridge, ipcRenderer } from "electron";
import log from "electron-log/renderer";

Object.assign(console, log.functions);

contextBridge.exposeInMainWorld("settingsIpc", {
  onTabChange: (onChange: (tab: string) => void) => {
    ipcRenderer.on("settings.tabs.change", (event, tab) => onChange(tab));
  },
  showWindow: (tab: string) => {
    ipcRenderer.send("settings.window.show", tab);
  },
  themeChange: (theme: string) => {
    ipcRenderer.send("theme.select", theme);
  },
  onThemeChange: (callback: (theme: string) => void) => {
    ipcRenderer.on("theme.updated", (e, theme) => callback(theme));
  },
  alert: (type: string, title: string, message: string) => {
    ipcRenderer.send("settings.alert", type, title, message);
  },
});

contextBridge.exposeInMainWorld("mainIpc", {
  selectImages: () => {
    ipcRenderer.send("imageOpen");
  },
  onSelectImages: (
    callback: (imgs: { url: string; content: string }[]) => void,
  ) => {
    ipcRenderer.once("imageOpen.response", (event, files) => {
      callback(files);
    });
  },
  minimize: () => {
    ipcRenderer.send("window.minimize");
  },
  maximize: () => {
    ipcRenderer.send("window.maximize");
  },
  unmaximize: () => {
    ipcRenderer.send("window.unmaximize");
  },
  close: () => {
    ipcRenderer.send("window.close");
  },
  showAbout: () => {
    ipcRenderer.send("window.about.open");
  },
  onCreateChat: (callback: () => void) => {
    ipcRenderer.on("chat.create", () => callback());
  },
  export: (name: string, chats: string[]) => {
    ipcRenderer.send("export", name, chats);
  },
});

contextBridge.exposeInMainWorld("env", {
  getPlatform: () => {
    return process.platform;
  },
});
