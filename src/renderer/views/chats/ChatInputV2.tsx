import { useEffect, useRef, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import IconFont from "../icons/iconFont";
import ImageList, { ImageSource } from "./ImageList";

export interface ChatInputProps {
  sendMessage: (message: string, images?: ImageSource[]) => void;
  inProcess: boolean;
  cancelProcess: () => void;
  sendKey: "return" | "cmd+return" | null;
  focus: string;
  supportImage: boolean;
}

function ChatInput({
  sendMessage,
  inProcess,
  cancelProcess,
  sendKey,
  focus,
  supportImage,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [imgs, setImgs] = useState<ImageSource[]>([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setMessage("");
  }, [focus]);

  const handleSend = () => {
    if (message.trim() === "") return;
    sendMessage(message, imgs);
    setMessage("");
    setImgs([]);
  };

  return (
    <div className="flex flex-none items-end gap-2 p-2">
      {supportImage && (
        <button
          className="min-h-[26px] min-w-[26px] rounded-full font-icon text-[16px] leading-[26px] text-secondary-light active:text-secondary-light/70 dark:text-secondary-dark active:dark:text-secondary-dark/70"
          onClick={(e) => {
            e.preventDefault();
            window.mainIpc.onSelectImages((images) => {
              if (!images) return;
              setImgs((prev) => [
                ...prev,
                ...images.map((v) => ({ content: v.content })),
              ]);
            });
            window.mainIpc.selectImages();
          }}
        >
          {IconFont.PhotoBadgePlus}
        </button>
      )}

      <ScrollArea.Root
        className="grow overflow-hidden data-[orientation=vertical]:w-[10px]"
        type="always"
      >
        <ScrollArea.Viewport className="h-fit max-h-[200px] grow items-center justify-center rounded-2xl border border-border-light px-3 pt-[1px] text-base dark:border-border-dark  [&>div]:!block">
          {imgs.length > 0 && (
            <ImageList
              images={imgs}
              updateImages={(images) => {
                setImgs(images);
              }}
            />
          )}
          <p>
            <ReactTextareaAutosize
              ref={inputRef}
              style={{ height: 20 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              className="h-[20px] w-full translate-y-[2px] resize-none bg-transparent text-base outline-none"
              onPaste={async (e) => {
                const items = await navigator.clipboard.read();
                if (items.length > 0) {
                  const item = items[0];
                  const exts = ["png", "jpg", "jpeg", "gif", "webp"];
                  const ext = exts.find((v) =>
                    item.types.includes(`image/${v}`),
                  );
                  if (ext) {
                    const blob = await item.getType(`image/${ext}`);
                    const reader = new FileReader();
                    reader.onload = () => {
                      setImgs((prev) => [
                        ...prev,
                        { content: reader.result as string },
                      ]);
                    };
                    reader.readAsDataURL(blob);
                  }
                }
              }}
              onKeyDown={(e) => {
                let handled = false;
                switch (sendKey) {
                  case "return":
                    handled =
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.ctrlKey &&
                      !e.altKey &&
                      !e.metaKey;
                    break;
                  case "cmd+return":
                    if (window.env.getPlatform() === "darwin") {
                      handled = e.key === "Enter" && e.metaKey;
                    } else {
                      handled = e.key === "Enter" && e.ctrlKey;
                    }
                    break;
                }
                if (handled) {
                  e.preventDefault();
                  if (!inProcess) {
                    handleSend();
                  }
                }
              }}
            />
          </p>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex w-[10px] touch-none select-none p-0.5 transition-colors"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-black/10 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[20px] before:w-full before:min-w-[20px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] dark:bg-white/10 dark:active:bg-white/20" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      <button
        title="Send Message"
        className="min-h-[26px] min-w-[26px] rounded-full bg-theme-light font-icon text-[13px] font-bold leading-[26px] text-white active:bg-theme-light/50 active:text-white/50 dark:bg-theme-dark dark:active:bg-theme-dark/50"
        onClick={(e) => {
          e.preventDefault();
          if (inProcess) {
            cancelProcess();
          } else {
            handleSend();
          }
        }}
      >
        {inProcess ? IconFont.SquareFill : IconFont.ArrowUp}
      </button>
    </div>
  );
}

export default ChatInput;
