import { useEffect, useState } from "react";
import Toolbar from "../toolbar/toolbar";
import { ToolbarItemProps } from "../toolbar/toolbarItem";
import ServerSetting from "./servers/serverSetting";
import { UserSetting } from "@/renderer/models/UserSetting";
import { getDatabase } from "@/renderer/models/BubbleDatabase";
import GeneralSetting from "./general/generalSetting";
import IconFont from "../icons/iconFont";
import { v4 as uuid } from "uuid";
import { Server, ServerType, defaultModels } from "@/renderer/models/Server";

function SettingApp() {
  // 设置状态来跟踪当前选中的标签
  const items = [
    { icon: IconFont.Gearshape, title: "General", id: "general" },
    { icon: IconFont.ServerRack, title: "Providers", id: "servers" },
  ] as ToolbarItemProps[];
  const [activeTab, setActiveTab] = useState(items[0].id);
  const [userSetting, setUserSetting] = useState<UserSetting | null>(null);
  const [title, setTitle] = useState(items[0].title);

  useEffect(() => {
    window.settingsIpc.onTabChange((tab) => {
      setActiveTab(tab);
    });
  }, []);

  useEffect(() => {
    const item = items.find((item) => item.id === activeTab);
    if (item) {
      setTitle(item.title);
    }
  }, [activeTab]);
  useEffect(() => {
    let subs: any;

    getDatabase().then((db) => {
      if (!db.user_settings) return;
      subs = db.user_settings.findOne().$.subscribe((setting) => {
        setUserSetting(setting);
      });
      if (!db.servers) return;
      db.servers
        .findOne()
        .exec()
        .then((server) => {
          if (!server) {
            const server = {
              id: uuid(),
              name: "Default Server",
              timestamp: new Date().getTime(),
              typ: ServerType.openAI,
              model: "gpt-3.5-turbo",
              models: defaultModels,
              defaultPrompt: "You are a helpful assistant.",
              path: "",
              key: "",
              apiVersion: "",
              status: "pending",
            } as Server;
            db.servers.insert(server).then(() => {});
          }
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
    }
  }, [userSetting]);

  // 渲染当前选中的标签页面
  const renderActiveTab = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSetting />;
      case "servers":
        return <ServerSetting />;
      default:
        return <div>General</div>;
    }
  };

  return (
    <div className="flex h-full w-full select-none flex-col">
      <div className="window-drag flex h-[20px] w-full justify-center bg-toolbar-bg-light pt-[3px]  dark:bg-toolbar-bg-dark">
        <div>{title}</div>
        {window.env.getPlatform() === "win32" && (
          <div className="absolute right-0 top-0">
            <div
              className="window-nodrag flex cursor-default select-none flex-col items-center px-3 py-1 text-secondary-light hover:bg-red-500 hover:text-white active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 hover:dark:bg-red-500 dark:hover:text-white dark:active:bg-white/10 dark:active:text-primary-dark"
              aria-label="Customise options"
              onClick={async (e) => {
                window.mainIpc.close();
              }}
            >
              <span className="font-icon text-[13px] font-normal">
                {IconFont.XMark}
              </span>
            </div>
          </div>
        )}
      </div>
      <Toolbar
        items={items}
        activeTab={activeTab}
        onClick={(id) => {
          setActiveTab(id);
        }}
      />
      <div className="flex w-full grow overflow-auto bg-control-bg-light p-4 dark:bg-control-bg-dark">
        {renderActiveTab()}
      </div>
    </div>
  );
}

export default SettingApp;
