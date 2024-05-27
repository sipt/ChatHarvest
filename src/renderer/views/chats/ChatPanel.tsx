import { useEffect, useRef, useState } from "react";
import { Session } from "@/renderer/models/Session";
import * as Popover from "@radix-ui/react-popover";
import { getDatabase } from "@/renderer/models/BubbleDatabase";
import SessionPopover from "../sessions/sessionPopover";
import SendChatBubble from "./SendChatBubble";
import ReceiveChatBubble from "./ReceiveChatBubble";
import ChatInput from "./ChatInputV2";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { Buffer } from "buffer";
import {
  ChatItem,
  ChatItemRole,
  MessageType,
  cloneChatItem,
} from "@/renderer/models/ChatItem";
import { Subscription, Observable, fromEvent, map, pairwise } from "rxjs";
import sessionService from "@/renderer/services/SessionService";
import { UserSetting } from "@/renderer/models/UserSetting";
import IconFont from "../icons/iconFont";
import { ImageSource } from "./ImageList";
import { supportImageInputModel } from "@/renderer/models/Server";

export interface ChatPanelProps {
  selectId: string;
}

function resizeObservable(elem: HTMLElement) {
  return new Observable((subscriber) => {
    const ro = new ResizeObserver((entries) => {
      subscriber.next(entries);
    });

    // Observe one or multiple elements
    ro.observe(elem);
    return function unsubscribe() {
      ro.unobserve(elem);
    };
  });
}

function ChatPanel({ selectId }: ChatPanelProps) {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [userSetting, setUserSetting] = useState<UserSetting | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef(null);
  const anchorRef = useRef(null);
  const [supportImage, setSupportImage] = useState(false);

  useEffect(() => {
    const scrollElement = scrollAreaRef.current;
    const scrollEvent$ = fromEvent(scrollElement, "scroll");
    const scroll$ = scrollEvent$.pipe(
      // debounceTime(50),
      map(() => {
        return {
          scrollTop: scrollElement.scrollTop,
          clientHeight: scrollElement.clientHeight,
        };
      }),
      pairwise(),
      // filter(([y1, y2]) => Math.abs(y1 - y2) > 10),
    );

    const scrollSubs = scroll$.subscribe({
      next: ([previous, current]) => {
        // 检测用户是否向上滚动
        if (current.scrollTop < previous.scrollTop) {
          setAutoScroll(false);
        }
        // 检测是否滚动到底部
        const position =
          scrollElement.scrollHeight -
          (scrollElement.scrollTop + scrollElement.clientHeight);
        if (-1 < position && position < 1) {
          setAutoScroll(true);
        }
      },
    });

    // 高度变化时，锁定在底部
    const resize$ = resizeObservable(scrollElement).pipe(
      // debounceTime(50),
      map(() => scrollElement.clientHeight),
      pairwise(),
    );
    const resizeSubs = resize$.subscribe({
      next: ([previous, current]) => {
        if (current < previous && autoScroll) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      },
    });

    return () => {
      scrollSubs.unsubscribe();
      resizeSubs.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectId) return;
    setAutoScroll(true);
    let isSubscribed = true; // 添加一个标志来追踪订阅状态
    let sessionSubs: Subscription;
    let chatItemsSubs: Subscription;
    let userSettingSubs: Subscription;

    getDatabase().then((db) => {
      if (!db.sessions) return;
      sessionSubs = db.sessions.findOne(selectId).$.subscribe((session) => {
        if (session && isSubscribed) {
          setSession(session);
        }
      });
      if (!db.chat_items) return;
      chatItemsSubs = db.chat_items
        .find({
          selector: { sessionId: selectId },
          sort: [{ timestamp: "asc" }],
        })
        .$.subscribe((chatItems) => {
          if (chatItems && isSubscribed) {
            setChatItems(chatItems.map((v) => cloneChatItem(v)));
          }
        });
      if (!db.user_settings) return;
      userSettingSubs = db.user_settings.findOne().$.subscribe((setting) => {
        setUserSetting(setting);
      });
    });

    // 取消订阅
    return () => {
      isSubscribed = false;
      sessionSubs && sessionSubs.unsubscribe();
      chatItemsSubs && chatItemsSubs.unsubscribe();
      userSettingSubs && userSettingSubs.unsubscribe();
    };
  }, [selectId]);

  useEffect(() => {
    let serverSubs: Subscription;

    getDatabase().then((db) => {
      if (!session) {
        setSupportImage(false);
        return;
      }
      if (!db.servers) return;
      serverSubs = db.servers
        .findOne(session.serverId)
        .$.subscribe((server) => {
          if (server) {
            setSupportImage(
              supportImageInputModel.findIndex((v) => v === server.model) !==
                -1,
            );
          }
        });
    });

    // 取消订阅
    return () => {
      serverSubs && serverSubs.unsubscribe();
    };
  }, [session]);

  useEffect(() => {
    if (!scrollAreaRef.current || !autoScroll) return;
    const scrollArea = scrollAreaRef.current as any;
    scrollArea.scrollTop = scrollArea.scrollHeight;
  }, [chatItems]);

  const handleDelete = async (id: string) => {
    const db = await getDatabase();
    await db.chat_items.findOne(id).remove();
  };

  const sendMessage = async (message: string, imgs?: ImageSource[]) => {
    try {
      setAutoScroll(true);
      if (!session) return;
      await sessionService.createSession(session.id, message, imgs);
    } catch (error) {
      console.error(error);
    }
  };

  const clearChatItem = async () => {
    try {
      if (!session) return;
      await sessionService.clearChatItems(session.id);
    } catch (error) {
      console.error(error);
    }
  };

  const exportChats = async () => {
    if (!session || !chatItems) return;
    const chats = chatItems.map((v) => {
      return `${v.role === ChatItemRole.User ? "User" : "Assistant"}:"""\n${
        v.content
      }\n"""`;
    });
    chats.splice(0, 0, `Prompt:"""\n${session.prompt}\n"""`);
    window.mainIpc.export(session.name, chats);
  };

  return (
    <div className="flex grow flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="window-drag flex max-h-[52px] w-full grow flex-row justify-between border-b border-toolbar-divider-light bg-toolbar-bg-light p-2 dark:border-toolbar-divider-dark dark:bg-toolbar-bg-dark">
        <div className="flex flex-1 flex-row items-center justify-center overflow-hidden">
          <span className="ml-2 mr-2 text-secondary-light dark:text-secondary-dark">
            To:
          </span>
          <span className="w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
            {(session && session.name) || ""}
          </span>
        </div>
        <div className="flex">
          <div
            className="window-nodrag ml-2 flex cursor-default select-none flex-col items-center rounded-lg px-2 py-1 text-secondary-light hover:bg-black/5 active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 dark:active:bg-white/10 dark:active:text-primary-dark"
            aria-label="Customise options"
            onClick={async (e) => {
              if (!session) {
                e.preventDefault();
                return;
              }
              await exportChats();
            }}
          >
            <span
              className="font-icon text-[18px] font-normal"
              title="Export all chats"
            >
              {IconFont.Export}
            </span>
          </div>
          <div
            className="window-nodrag ml-2 flex cursor-default select-none flex-col items-center rounded-lg px-2 py-1 text-secondary-light hover:bg-black/5 active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 dark:active:bg-white/10 dark:active:text-primary-dark"
            aria-label="Customise options"
            onClick={async (e) => {
              if (!session) {
                e.preventDefault();
                return;
              }
              await clearChatItem();
            }}
          >
            <span
              className="font-icon text-[18px] font-normal"
              title="Clear all chats"
            >
              {IconFont.Trash}
            </span>
          </div>
          <Popover.Root>
            <Popover.Trigger asChild disabled={session === undefined}>
              <div
                className="window-nodrag ml-2 flex cursor-default select-none flex-col items-center rounded-lg px-2 py-1 text-secondary-light hover:bg-black/5 active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 dark:active:bg-white/10 dark:active:text-primary-dark"
                aria-label="Customise options"
                onClick={(e) => {
                  if (!session) {
                    e.preventDefault();
                  }
                }}
              >
                <span
                  className="font-icon text-[18px] font-normal"
                  title="Edit session info."
                >
                  {IconFont.InfoCircle}
                </span>
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="z-10 mr-2 w-[360px] -translate-y-2 select-none rounded bg-popover-bg-light p-[3px] text-sm shadow-xl outline-none ring-[1px] ring-border-light dark:bg-popover-bg-dark dark:ring-border-dark"
                sideOffset={5}
              >
                <SessionPopover selectId={selectId} />
                <Popover.Arrow className="fill-popover-bg-light dark:fill-popover-bg-dark" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {window.env.getPlatform() === "win32" && (
            <>
              <div
                className=" window-nodrag ml-3 flex cursor-default select-none flex-col items-center justify-center rounded px-3 text-secondary-light hover:bg-black/5 active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 dark:active:bg-white/10 dark:active:text-primary-dark"
                aria-label="Customise options"
                onClick={async (e) => {
                  window.mainIpc.minimize();
                }}
              >
                <span className="font-icon text-[13px] font-normal">
                  {IconFont.Minus}
                </span>
              </div>
              <div
                className="window-nodrag flex cursor-default select-none flex-col items-center justify-center rounded px-3 text-secondary-light hover:bg-black/5 active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 dark:active:bg-white/10 dark:active:text-primary-dark"
                aria-label="Customise options"
                onClick={async (e) => {
                  window.mainIpc.maximize();
                }}
              >
                <span className="font-icon text-[13px] font-normal">
                  {IconFont.Square}
                </span>
              </div>
              <div
                className="window-nodrag flex cursor-default select-none flex-col items-center justify-center rounded px-3 text-secondary-light hover:bg-red-500 hover:text-white active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 hover:dark:bg-red-500 dark:hover:text-white dark:active:bg-white/10 dark:active:text-primary-dark"
                aria-label="Customise options"
                onClick={async (e) => {
                  window.mainIpc.close();
                }}
              >
                <span className="font-icon text-[13px] font-normal">
                  {IconFont.XMark}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <ScrollArea.Root
        className="grow overflow-hidden data-[orientation=horizontal]:h-[10px] data-[orientation=vertical]:w-[10px] data-[orientation=horizontal]:flex-col"
        type="always"
      >
        <ScrollArea.Viewport
          ref={scrollAreaRef}
          className="h-full w-full rounded [&>div]:!block"
        >
          <div className="flex flex-col">
            {chatItems.map((chatItem, index) => {
              return (
                <ContextMenu.Root key={index}>
                  <ContextMenu.Trigger>
                    {chatItem.role === ChatItemRole.User ? (
                      <SendChatBubble key={index} item={chatItem} />
                    ) : (
                      <ReceiveChatBubble key={index} item={chatItem} />
                    )}
                  </ContextMenu.Trigger>
                  <ContextMenu.Portal>
                    <ContextMenu.Content className="z-20 min-w-[100px] rounded-md border border-border-light bg-box-bg-light p-1 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] dark:border-border-dark dark:bg-box-bg-dark">
                      <ContextMenu.Item
                        className="text-violet11 relative flex h-6 select-none items-center rounded-[3px] pl-2 pr-2 text-sm leading-none outline-none hover:bg-list-select-light dark:hover:bg-list-select-dark"
                        onClick={() => {
                          if (chatItem.messageType === MessageType.Text) {
                            navigator.clipboard.writeText(chatItem.content);
                          } else {
                            const content = chatItem.content;
                            // get image type
                            const type = content.substring(
                              "data:".length,
                              content.indexOf(";base64,"),
                            );
                            // remove base64 prefix
                            const data = content.substring(
                              content.indexOf(";base64,") + ";base64,".length,
                            );
                            const buffer = Buffer.from(data, "base64");
                            const blob = new Blob([buffer], { type });
                            navigator.clipboard.write([
                              new ClipboardItem({
                                [type]: blob,
                              }),
                            ]);
                          }
                        }}
                      >
                        Copy
                      </ContextMenu.Item>
                      <ContextMenu.Separator className="m-[5px] h-[1px] bg-border-light dark:bg-border-dark" />
                      <ContextMenu.Item
                        className="text-violet11 relative flex h-6 select-none items-center rounded-[3px] pl-2 pr-2 text-sm leading-none outline-none hover:bg-list-select-light dark:hover:bg-list-select-dark"
                        onClick={() => {
                          handleDelete(chatItem.id);
                        }}
                      >
                        Delete
                      </ContextMenu.Item>
                    </ContextMenu.Content>
                  </ContextMenu.Portal>
                </ContextMenu.Root>
              );
            })}
            <div className="h-4" ref={anchorRef}></div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex w-[10px] touch-none select-none p-0.5 transition-colors"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-black/10 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[20px] before:w-full before:min-w-[20px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] dark:bg-white/10 dark:active:bg-white/20" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      <ChatInput
        sendKey={userSetting && userSetting.sendKey}
        focus={selectId}
        sendMessage={sendMessage}
        inProcess={session && session.inProcess}
        cancelProcess={() => {
          sessionService.cancelSession(session.id);
        }}
        supportImage={supportImage}
      />
    </div>
  );
}

export default ChatPanel;
