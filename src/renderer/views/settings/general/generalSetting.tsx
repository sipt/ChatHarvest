import { useEffect, useState } from "react";
import DebouncedInput from "../../input/debouncedInput";
import BSelect from "../../select/select";
import { UserSetting } from "@/renderer/models/UserSetting";
import { getDatabase } from "@/renderer/models/BubbleDatabase";

export function GeneralSetting() {
  const [userSettings, setUserSettings] = useState<UserSetting | null>(null);
  useEffect(() => {
    let subs: any;

    getDatabase().then((db) => {
      if (!db.user_settings) return;
      subs = db.user_settings.findOne().$.subscribe((setting) => {
        setUserSettings(setting);
      });
    });

    // 取消订阅
    return () => subs && subs.unsubscribe();
  });

  return (
    <div className="flex w-[400px] cursor-default select-none flex-col gap-3 text-base">
      <div className="flex flex-row gap-3">
        <div className="w-[200px] text-right">Appearance:</div>
        <BSelect
          defaultValue={"system"}
          value={userSettings && userSettings.theme}
          options={[
            { value: "system", label: "System" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
          onValueChange={async (value) => {
            const db = await getDatabase();
            await db.user_settings
              .findOne(userSettings.id)
              .update({ $set: { theme: value } });
            window.settingsIpc.themeChange(value);
          }}
        />
      </div>
      <div className="flex flex-row items-center gap-3">
        <div className="w-[200px] text-right">Send Message:</div>
        <BSelect
          defaultValue={"system"}
          value={userSettings && userSettings.sendKey}
          options={[
            { value: "return", label: "Return" },
            {
              value: "cmd+return",
              label:
                window.env.getPlatform() === "darwin"
                  ? "Cmd + Return"
                  : "Ctrl + Return",
            },
          ]}
          onValueChange={async (value) => {
            const db = await getDatabase();
            await db.user_settings
              .findOne(userSettings.id)
              .update({ $set: { sendKey: value } });
          }}
        />
      </div>
    </div>
  );
}

export default GeneralSetting;
