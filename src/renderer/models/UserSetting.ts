export interface UserSetting {
  id: string;
  theme: string;
  fontSize: number;
  language: string;
  sendKey: "return" | "cmd+return";
}

export function cloneUserSetting(userSetting: UserSetting): UserSetting {
  return {
    id: userSetting.id,
    theme: userSetting.theme,
    fontSize: userSetting.fontSize,
    language: userSetting.language,
    sendKey: userSetting.sendKey,
  };
}

export const userSettingSchema = {
  title: "userSetting schema",
  version: 0,
  type: "object",
  properties: {
    id: {
      type: "string",
      primary: true,
      maxLength: 36,
    },
    theme: {
      type: "string",
    },
    fontSize: {
      type: "integer",
    },
    language: {
      type: "string",
    },
    sendKey: {
      type: "string",
    },
  },
  primaryKey: "id",
  required: ["theme", "sendKey"],
};
