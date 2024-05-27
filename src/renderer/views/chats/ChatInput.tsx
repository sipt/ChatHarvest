import { useEffect, useRef, useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import IconFont from "../icons/iconFont";

export interface ChatInputProps {
  sendMessage: (message: string) => void;
  inProcess: boolean;
  cancelProcess: () => void;
  sendKey: "return" | "cmd+return" | null;
  focus: string;
}

function ChatInput({
  sendMessage,
  inProcess,
  cancelProcess,
  sendKey,
  focus,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setMessage("");
  }, [focus]);

  const handleSend = () => {
    if (message.trim() === "") return;
    sendMessage(message);
    setMessage("");
  };

  return (
    <div className=" flex flex-none items-end gap-2 p-2">
      <ReactTextareaAutosize
        ref={inputRef}
        style={{ height: 28 }}
        maxRows={8}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        className="grow resize-none rounded-2xl border border-border-light bg-transparent px-3 py-[2px] text-base outline-none dark:border-border-dark"
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
              handled = e.key === "Enter" && e.metaKey;
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
      <button
        className="h-[26px] w-[26px] rounded-full bg-theme-light font-icon text-[13px] font-bold leading-[26px] text-white active:bg-theme-light/50 active:text-white/50 dark:bg-theme-dark dark:active:bg-theme-dark/50"
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
