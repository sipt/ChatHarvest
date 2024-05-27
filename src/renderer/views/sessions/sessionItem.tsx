import { getDatabase } from "@/renderer/models/BubbleDatabase";
import { Session } from "@/renderer/models/Session";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { useState } from "react";
import TypingLabel from "../chats/typingLabel";
import IconFont from "../icons/iconFont";

interface SessionItemProps {
  session: Session;
  selectedId: string;
  onClick: (id: string) => void;
}

function SessionItem(props: SessionItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const handlePin = async () => {
    const db = await getDatabase();
    await db.sessions.findOne(props.session.id).update({
      $set: {
        pinnedAt: props.session.pinnedAt ? undefined : new Date().getTime(),
      },
    });
  };

  const handleDelete = async () => {
    const db = await getDatabase();
    props.onClick("");
    await db.sessions.findOne(props.session.id).remove();
    await db.chat_items
      .find({ selector: { sessionId: props.session.id } })
      .remove();
  };

  return (
    <ContextMenu.Root onOpenChange={(state) => setMenuOpen(state)}>
      <ContextMenu.Trigger>
        <div className="w-full px-3">
          <div
            className={[
              "my-1 flex h-16 w-full select-none flex-row items-center rounded-md px-2 ring-list-select-light dark:ring-list-select-dark",
              menuOpen ? "ring-2" : "",
              props.selectedId === props.session.id
                ? "bg-list-select-light dark:bg-list-select-dark"
                : "",
            ].join(" ")}
            onClick={(e) => {
              e.preventDefault();
              props.onClick(props.session.id);
            }}
          >
            <div className="inline-flex h-8 w-8 items-center justify-center font-emoji text-[32px]">
              {props.session.emoji}
            </div>
            <div className="inline-flex grow flex-col overflow-hidden pl-2">
              <span
                className={[
                  "text-md grow overflow-hidden overflow-ellipsis whitespace-nowrap font-bold",
                  props.selectedId === props.session.id
                    ? "text-primary-dark"
                    : "",
                ].join(" ")}
              >
                {props.session.name}
              </span>

              {props.session.inProcess ? (
                <div className="flex h-4 items-center">
                  <TypingLabel />
                </div>
              ) : (
                <span
                  className={[
                    "line-clamp-2 overflow-hidden overflow-ellipsis text-sm",
                    props.selectedId === props.session.id
                      ? "text-secondary-dark"
                      : "text-secondary-light dark:text-secondary-dark",
                  ].join(" ")}
                >
                  {props.session.prompt}
                </span>
              )}
            </div>
            {props.session.pinnedAt && (
              <div className="absolute right-4 top-[5px] h-[10px] w-[10px] rotate-45">
                <span
                  className={[
                    "font-icon text-primary-light dark:text-primary-dark",
                    props.selectedId === props.session.id
                      ? "text-secondary-dark"
                      : "text-secondary-light dark:text-secondary-dark",
                  ].join(" ")}
                >
                  {IconFont.PinFill}
                </span>
              </div>
            )}
          </div>
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-[100px] rounded-md border border-border-light bg-box-bg-light p-1 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] dark:border-border-dark dark:bg-box-bg-dark">
          <ContextMenu.Item
            className="text-violet11 relative flex h-6 select-none items-center rounded-[3px] pl-2 pr-2 text-sm leading-none outline-none hover:bg-list-select-light dark:hover:bg-list-select-dark"
            onClick={handlePin}
          >
            {props.session.pinnedAt ? "Unpin" : "Pin"}
          </ContextMenu.Item>
          <ContextMenu.Separator className="m-[5px] h-[1px] bg-border-light dark:bg-border-dark" />
          <ContextMenu.Item
            className="text-violet11 relative flex h-6 select-none items-center rounded-[3px] pl-2 pr-2 text-sm leading-none outline-none hover:bg-list-select-light dark:hover:bg-list-select-dark"
            onClick={handleDelete}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

export default SessionItem;
