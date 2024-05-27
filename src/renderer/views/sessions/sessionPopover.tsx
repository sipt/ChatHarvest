import { useEffect, useState } from "react";
import { Session, cloneSession } from "@/renderer/models/Session";
import { getDatabase } from "@/renderer/models/BubbleDatabase";
import DebouncedInput from "../input/debouncedInput";
import DebouncedTextarea from "../input/debouncedTextarea";
import DebouncedSlider from "../slider/debouncedSlider";
import BSelect from "../select/select";
import { Server } from "@/renderer/models/Server";
import EmojiPanel from "../emoji/emojiPanel";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { motion, AnimatePresence } from "framer-motion";

export interface SessionPopoverProps {
  selectId: string;
}

function SessionPopover({ selectId }: SessionPopoverProps) {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [servers, server] = useState<Server[]>([]);
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);
  const variants = {
    open: { opacity: 1, maxHeight: 500 }, // 这里的 maxHeight 应该设为预估的最大高度
    closed: { opacity: 0, maxHeight: 0 },
  };
  useEffect(() => {
    if (!selectId) return;
    let serversSubs: any;

    getDatabase().then((db) => {
      if (!db.sessions) return;
      db.sessions
        .findOne(selectId)
        .exec()
        .then((session) => {
          if (session) {
            setSession(cloneSession(session));
          }
        });
      if (!db.servers) return;
      serversSubs = db.servers
        .find({
          selector: { status: "available" },
          sort: [{ timestamp: "asc" }],
        })
        .$.subscribe((servers) => {
          if (servers) {
            server(servers);
          }
        });
    });

    // 取消订阅
    return () => {
      serversSubs && serversSubs.unsubscribe();
    };
  }, [selectId]);

  const handleUpdateSession = (
    id: string,
    field: keyof Session,
    value: any,
  ) => {
    getDatabase().then((db) => {
      if (!db.sessions) return;
      db.sessions
        .findOne(id)
        .update({ $set: { [field]: value } })
        .then(() => {})
        .catch((error) => {
          console.error(`Failed to update ${field}:`, error);
        });
    });
  };

  return session === undefined ? null : (
    <div className="flex flex-col items-start p-4">
      <div className="m-2 flex h-[50px] w-full justify-center">
        <div
          className="h-[50px] w-[50px] rounded-md text-center font-emoji text-[35px] hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/5 dark:active:bg-white/10"
          onClick={() => {
            setEmojiPanelOpen((old) => !old);
          }}
        >
          <span>{session.emoji}</span>
        </div>
      </div>
      <AnimatePresence>
        {emojiPanelOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants} // 使用variants简化动画属性的传递
            transition={{ duration: 0.5 }}
            key="emojiPanel" // 为动画组件指定一个key
            className="overflow-hidden" // 防止在动画过程中内容溢出
          >
            <ScrollArea.Root
              className="my-4 h-[250px] overflow-hidden bg-background-light transition-height duration-500 ease-in-out data-[orientation=horizontal]:h-[10px] data-[orientation=vertical]:w-[10px] data-[orientation=horizontal]:flex-col dark:bg-background-dark"
              type="always"
            >
              <ScrollArea.Viewport className="h-full w-full rounded">
                <EmojiPanel
                  onSelect={(e) => {
                    session.emoji = e;
                    handleUpdateSession(session.id, "emoji", e);
                  }}
                />
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                className="flex w-[10px] touch-none select-none p-0.5 transition-colors"
                orientation="vertical"
              >
                <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-black/10 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] dark:bg-white/10 dark:active:bg-white/20" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-2.5 flex w-full flex-row items-center gap-3">
        <div className="w-20 text-right">Name:</div>
        <DebouncedInput
          className="grow rounded border border-border-light bg-input-bg-light px-1 outline-none dark:border-border-dark dark:bg-input-bg-dark"
          value={session.name}
          debouncedMs={200}
          debouncedOnChange={(value) => {
            handleUpdateSession(session.id, "name", value);
          }}
        />
      </div>
      <div className="mt-2.5 flex w-full flex-row items-center gap-3">
        <div className="w-20 text-right">Provider:</div>
        <BSelect
          value={session.serverId}
          onValueChange={(value) => {
            handleUpdateSession(session.id, "serverId", value);
          }}
          options={servers.map((server) => {
            return { value: server.id, label: server.name };
          })}
        />
      </div>
      <div className="mt-2.5 w-full border-b border-border-light px-7 dark:border-border-dark"></div>
      <div className="mt-2.5 flex w-full flex-row items-center gap-3">
        <div className="w-20 text-right">Histroy Limit:</div>
        <DebouncedInput
          className="grow appearance-none rounded border border-border-light bg-input-bg-light px-1 outline-none dark:border-border-dark dark:bg-input-bg-dark"
          value={session.limit}
          debouncedMs={200}
          type="number"
          debouncedOnChange={(value) => {
            handleUpdateSession(session.id, "limit", +value);
          }}
        />
      </div>
      <div className="mt-2.5 flex w-full flex-row items-center gap-3">
        <div className="w-20 text-right">Temperature:</div>
        <DebouncedSlider
          value={[session.temperature]}
          min={0}
          max={2}
          step={0.1}
          debouncedMs={200}
          debouncedOnChange={(vs) => {
            handleUpdateSession(session.id, "temperature", vs[0]);
          }}
        />
      </div>
      <div className="mt-2.5 flex w-full flex-row items-start gap-3">
        <div className="w-20 text-right">Prompts:</div>
        <DebouncedTextarea
          className="grow resize-none appearance-none rounded border border-border-light bg-input-bg-light px-1 outline-none dark:border-border-dark dark:bg-input-bg-dark"
          value={session.prompt}
          debouncedMs={200}
          rows={8}
          debouncedOnChange={(value) => {
            // session.prompt = value;
            handleUpdateSession(session.id, "prompt", value);
          }}
        />
      </div>
    </div>
  );
}

export default SessionPopover;
