import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("settingsIpc", {
  selectTab: (tab: string) => ipcRenderer.send("", tab),
});
