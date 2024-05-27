import { startTransition, useEffect, useRef, useState } from "react";
import { Session } from "@/renderer/models/Session";
import SessionItem from "./sessionItem";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Server } from "@/renderer/models/Server";
import { getDatabase } from "@/renderer/models/BubbleDatabase";
import { v4 as uuid } from "uuid";
import { emojiPool } from "@/renderer/support/emoji";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import IconFont from "../icons/iconFont";
import SessionEmpty from "./sessionEmpty";

export interface SessionListProps {
  selectId?: string;
  onSelect?: (id: string) => void;
}

function SessionList(props: SessionListProps) {
  const [selectId, setSelectId] = useState<string | undefined>("");
  const [servers, setServers] = useState<Server[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [openServerMenu, setOpenServerMenu] = useState(false);

  useEffect(() => {
    window.mainIpc.onCreateChat(createChat);
  }, []);

  const createChat = () => {
    getDatabase().then((db) => {
      if (!db.servers) return;
      db.servers
        .find({ selector: { status: "available" } })
        .exec()
        .then((servers) => {
          console.log(servers.length);
          if (servers.length === 0) {
            handleSettings("servers");
          } else if (servers.length === 1) {
            handleAddSession(servers[0]);
          } else {
            setOpenServerMenu(true);
          }
        });
    });
  };

  useEffect(() => {
    let serverSubs: any;
    let sessionSubs: any;

    getDatabase().then((db) => {
      if (!db.servers) return;
      serverSubs = db.servers
        .find({
          selector: { status: "available" },
          sort: [{ timestamp: "asc" }],
        })
        .$.subscribe((servers) => {
          if (servers) {
            setServers(servers);
          }
        });
      sessionSubs = db.sessions
        .find({ sort: [{ pinnedAt: "desc" }, { timestamp: "asc" }] })
        .$.subscribe((sessions) => {
          if (sessions) {
            setSessions(sessions);
          }
        });
    });

    // 取消订阅
    return () => {
      serverSubs && serverSubs.unsubscribe();
      sessionSubs && sessionSubs.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setSelectId(props.selectId);
  }, [props.selectId]);

  const handleAddSession = async (server: Server) => {
    const db = await getDatabase();
    const session = {
      id: uuid(),
      emoji: emojiPool.getRandomEmoji(),
      name: "New Session",
      timestamp: new Date().getTime(),
      serverId: server.id,
      prompt: server.defaultPrompt,
      temperature: 1,
      limit: 10,
      inProcess: false,
    } as Session;
    setSelectId(session.id);
    props.onSelect && props.onSelect(session.id);
    await db.sessions.insert(session);
  };

  const handleSettings = async (tab: string) => {
    window.settingsIpc.showWindow(tab);
  };
  const handleAbout = () => {
    window.mainIpc.showAbout();
  };

  return (
    <div
      className={`flex h-full flex-col ${
        window.env.getPlatform() === "win32" &&
        "bg-sider-light dark:bg-sider-dark"
      }`}
    >
      <div
        className={`window-drag flex w-full select-none flex-row ${
          window.env.getPlatform() === "win32"
            ? "justify-between"
            : "justify-end"
        } p-2`}
      >
        {window.env.getPlatform() === "win32" && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <div
                className="window-nodrag flex cursor-default select-none flex-col items-center rounded-lg px-2 py-1 text-secondary-light hover:bg-black/5 active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 dark:active:bg-white/10 dark:active:text-primary-dark"
                aria-label="Customise options"
              >
                <span className="font-icon text-xl font-normal">
                  {IconFont.ListBullet}
                </span>
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[100px] translate-x-2 rounded bg-popover-bg-light p-[3px] shadow-xl ring-[1px] ring-border-light dark:bg-popover-bg-dark dark:ring-border-dark"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  className="text-violet11 relative flex h-6 select-none items-center rounded-[3px] pl-2 pr-2 text-sm leading-6 outline-none hover:bg-list-select-light hover:text-primary-dark dark:hover:bg-list-select-dark"
                  onClick={() => {
                    handleAbout();
                  }}
                >
                  About...
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 border-b-[1px] border-border-light dark:border-border-dark" />
                <DropdownMenu.Item
                  className="text-violet11 relative flex h-6 select-none items-center rounded-[3px] pl-2 pr-2 text-sm leading-6 outline-none hover:bg-list-select-light hover:text-primary-dark dark:hover:bg-list-select-dark"
                  onClick={() => {
                    handleSettings("general");
                  }}
                >
                  Settings...
                </DropdownMenu.Item>
                {/* <DropdownMenu.Arrow className="fill-popover-bg-light dark:fill-popover-bg-dark" /> */}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
        {servers.length <= 1 ? (
          <div
            className="window-nodrag ml-2 flex cursor-default select-none flex-col items-center rounded-lg px-2 py-1 text-secondary-light hover:bg-black/5 active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 dark:active:bg-white/10 dark:active:text-primary-dark"
            onClick={(e) => {
              e.preventDefault();
              if (servers.length === 0) {
                handleSettings("servers");
              } else {
                handleAddSession(servers[0]);
              }
            }}
          >
            <span
              className="font-icon text-xl font-normal"
              title={
                servers.length === 0
                  ? "New Chat (Since no server will go to Settings)"
                  : "New Chat"
              }
            >
              {IconFont.PlusMessage}
            </span>
          </div>
        ) : (
          <DropdownMenu.Root
            open={openServerMenu}
            onOpenChange={setOpenServerMenu}
          >
            <DropdownMenu.Trigger asChild>
              <div
                className="window-nodrag ml-2 flex cursor-default select-none flex-col items-center rounded-lg px-2 py-1 text-secondary-light hover:bg-black/5 active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 dark:active:bg-white/10 dark:active:text-primary-dark"
                aria-label="Customise options"
              >
                <span className="font-icon text-xl font-normal">
                  {IconFont.PlusMessage}
                </span>
                <div className="relative">
                  <span className="absolute -top-2 left-1 font-icon text-[8px] font-bold">
                    {IconFont.ChevronDown}
                  </span>
                </div>
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[100px] rounded bg-popover-bg-light p-[3px] shadow-xl ring-[1px] ring-border-light dark:bg-popover-bg-dark dark:ring-border-dark"
                sideOffset={5}
              >
                {servers.map((server, index) => (
                  <DropdownMenu.Item
                    key={index}
                    className="text-violet11 relative flex h-6 select-none items-center rounded-[3px] pl-2 pr-2 text-sm leading-6 outline-none data-[highlighted]:bg-list-select-light data-[highlighted]:text-primary-dark dark:data-[highlighted]:bg-list-select-dark"
                    onSelect={() => {
                      handleAddSession(server);
                    }}
                  >
                    {server.name}
                  </DropdownMenu.Item>
                ))}
                {servers.length <= 0 && (
                  <DropdownMenu.Label className="select-none pl-2 pr-2 text-sm  leading-6 text-secondary-light/50 dark:text-secondary-dark/50">
                    No Servers
                  </DropdownMenu.Label>
                )}
                <DropdownMenu.Separator className="my-1 border-b-[1px] border-border-light dark:border-border-dark" />
                <DropdownMenu.Item
                  className="text-violet11 relative flex h-6 select-none items-center rounded-[3px] pl-2 pr-2 text-sm leading-6 outline-none data-[highlighted]:bg-list-select-light data-[highlighted]:text-primary-dark dark:data-[highlighted]:bg-list-select-dark"
                  onSelect={() => {
                    handleSettings("servers");
                  }}
                >
                  Settings...
                </DropdownMenu.Item>
                {/* <DropdownMenu.Arrow className="fill-popover-bg-light dark:fill-popover-bg-dark" /> */}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
      {sessions.length > 0 ? (
        <ScrollArea.Root
          className="grow overflow-hidden data-[orientation=horizontal]:h-[10px] data-[orientation=vertical]:w-[10px] data-[orientation=horizontal]:flex-col"
          type="always"
        >
          <ScrollArea.Viewport className="h-full w-full rounded [&>div]:!block">
            <div className="flex flex-col">
              {sessions.map((session, index) => (
                <SessionItem
                  key={index}
                  session={session}
                  selectedId={selectId}
                  onClick={(id) => {
                    setSelectId(id);
                    startTransition(() => {
                      props.onSelect && props.onSelect(id);
                    });
                  }}
                />
              ))}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex w-[10px] touch-none select-none p-0.5 transition-colors"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-black/10 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] dark:bg-white/10 dark:active:bg-white/20" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      ) : (
        <SessionEmpty />
      )}
    </div>
  );
}

export default SessionList;
