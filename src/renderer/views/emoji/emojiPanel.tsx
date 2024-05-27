import { emojiPool } from "@/renderer/support/emoji";
import { useEffect, useState } from "react";

export interface EmojiPanelProps {
  onSelect: (emoji: string) => void;
}

function EmojiPanel({ onSelect }: EmojiPanelProps) {
  const [emojiList, setEmojiList] = useState<string[]>([]);
  useEffect(() => {
    setEmojiList(emojiPool.getAllEmojis());
  });

  return (
    <div className="flex cursor-default select-none flex-row flex-wrap font-emoji">
      {emojiList.map((emoji, index) => (
        <div
          key={index}
          className="inline-block rounded-md p-1 text-[16px] hover:bg-black/5 active:bg-black/10 dark:hover:bg-white/5 dark:active:bg-white/10 "
          onClick={(e) => {
            e.preventDefault();
            onSelect(emoji);
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}

export default EmojiPanel;
