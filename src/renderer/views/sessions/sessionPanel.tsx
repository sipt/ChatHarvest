import { useState } from "react";
import ChatPanel from "../chats/ChatPanel";
import SessionList from "./sessionList";
import EmptyPanel from "../chats/emtpyPanel";

function SessionPanel() {
  const [selectId, setSelectId] = useState<string | undefined>(undefined);
  return (
    <>
      <div className="w-[250px] min-w-[250px] border-r border-sash-light dark:border-shadow-dark">
        <SessionList
          selectId={selectId}
          onSelect={(id) => {
            setSelectId(id);
          }}
        />
      </div>
      {selectId ? <ChatPanel selectId={selectId} /> : <EmptyPanel />}
    </>
  );
}

export default SessionPanel;
