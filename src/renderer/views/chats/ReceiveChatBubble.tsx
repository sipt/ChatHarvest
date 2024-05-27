import ReactMarkdown from "react-markdown";
import React, { useMemo } from "react";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import CodeCopyBtn from "./CodeCopyBtn";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { ChatItem, ChatItemState } from "@/renderer/models/ChatItem";
import TypingLabel from "./typingLabel";
import * as Popover from "@radix-ui/react-popover";
import IconFont from "../icons/iconFont";

function ReceiveChatBubble({ item }: { item: ChatItem }) {
  // Add the CodeCopyBtn component to our PRE element
  const Pre = ({ children }: { children: React.ReactElement }) => (
    <pre className="blog-pre">
      <CodeCopyBtn>{children}</CodeCopyBtn>
      {children}
    </pre>
  );
  return useMemo(
    () => (
      <div className="flex w-full flex-col gap-2 p-4">
        <div className="flex w-full items-center gap-2">
          <div
            className={
              "markdown-body max-w-[75%] rounded-t-xl rounded-ee-xl bg-bubble-receive-light p-2 dark:bg-bubble-receive-dark " +
              (item.content.includes("```") ? "w-[75%]" : "")
            }
          >
            <ReactMarkdown
              className="post-markdown"
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
              components={{
                pre: Pre,
                code({ node, className = "blog-code", children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isBlock = String(children).includes("\n");
                  let language = "txt";
                  if (isBlock && match) {
                    language = match[1];
                  }
                  return isBlock ? (
                    <ScrollArea.Root
                      className="h-full w-full grow overflow-hidden data-[orientation=horizontal]:h-[10px] data-[orientation=vertical]:w-[10px] data-[orientation=horizontal]:flex-col"
                      type="always"
                    >
                      <ScrollArea.Viewport className="h-full w-full rounded">
                        <SyntaxHighlighter
                          style={oneDark}
                          language={language}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </ScrollArea.Viewport>
                      <ScrollArea.Scrollbar
                        className="flex h-[10px] -translate-y-1 touch-none select-none p-0.5 transition-colors"
                        orientation="horizontal"
                      >
                        <ScrollArea.Thumb className="relative rounded-[10px] bg-black/10 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] dark:bg-white/10 dark:active:bg-white/20" />
                      </ScrollArea.Scrollbar>
                    </ScrollArea.Root>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
              urlTransform={(url) => {
                return url;
              }}
            >
              {item.state === ChatItemState.Failed && !item.content
                ? "(Empty Content)"
                : item.content}
            </ReactMarkdown>
            {(item.state === ChatItemState.Waiting ||
              item.state === ChatItemState.Generating) && <TypingLabel />}
          </div>

          {item.state === ChatItemState.Failed && (
            <div className="flex h-[18px] w-[18px] cursor-default select-none items-center justify-center rounded-full bg-red-500 font-icon text-sm font-bold">
              <span>{IconFont.Exclamationmark}</span>
            </div>
          )}
        </div>
        {item.state === ChatItemState.Failed && (
          <div className="px-2 text-red-500">{item.errorMsg}</div>
        )}
      </div>
    ),
    [item.content, item.state],
  );
}

export default ReceiveChatBubble;
