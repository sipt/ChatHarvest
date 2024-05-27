import "./assets/github-markdown.css";
import { useEffect, useState } from "react";
import { UserSetting } from "./models/UserSetting";
import { getDatabase } from "./models/BubbleDatabase";
import SessionPanel from "./views/sessions/sessionPanel";
import "openai/shims/web";

function App() {
  const [userSetting, setUserSetting] = useState<UserSetting | null>(null);

  useEffect(() => {
    let subs: any;

    getDatabase().then((db) => {
      if (!db.user_settings) return;
      subs = db.user_settings.findOne().$.subscribe((setting) => {
        setUserSetting(setting);
        window.settingsIpc.themeChange(setting.theme);
      });
    });

    // 取消订阅
    return () => subs && subs.unsubscribe();
  }, []);

  const getTheme = () => {
    if (userSetting) {
      switch (userSetting.theme) {
        case "system":
          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
          } else {
            return "light";
          }
        case "light":
          return "light";
        case "dark":
          return "dark";
      }
    }
    return "light";
  };

  useEffect(() => {
    if (userSetting) {
      document.documentElement.setAttribute("data-theme", getTheme());
      // init dom
    }
  }, [userSetting]);

  return (
    <div className="flex h-screen w-screen flex-row">
      <SessionPanel />
    </div>
  );
}

export default App;
