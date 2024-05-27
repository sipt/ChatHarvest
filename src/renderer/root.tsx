/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```u
 */

import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/index.css";
import App from "./App";
import { getDatabase } from "./models/BubbleDatabase";
import { UserSetting, cloneUserSetting } from "./models/UserSetting";

async function initApp() {
  // init DB
  try {
    const db = await getDatabase();
    const setting = await db.user_settings.findOne().exec();
    if (!setting) {
      await db.user_settings.insert({
        id: "1",
        theme: "system",
        fontSize: 13,
        language: navigator.language,
        sendKey: "return",
      } as UserSetting);
    }
  } catch (err) {
    console.error(err);
  }

  window.settingsIpc.onThemeChange((theme) => {
    document.documentElement.setAttribute("data-theme", theme);
  });

  // init dom
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

initApp();
