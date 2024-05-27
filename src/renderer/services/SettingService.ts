import { UserSetting, db } from "../models/BubbleDatabase";

class SettingService {
  async init() {
    const settings = await db.settings.get(1);
    if (settings) {
      return;
    }
    await db.settings.put({
      id: 1,
      theme: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light",
      fontSize: 16,
      language: navigator.language,
    } as UserSetting);
  }

  async getSettings() {
    return await db.settings.get(1);
  }

  async updateSettings(settings: UserSetting) {
    const oldSettings = await db.settings.get(1);
    settings = { ...oldSettings, ...settings };
    await db.settings.update(1, settings);
  }
}

export const settingService = new SettingService();
