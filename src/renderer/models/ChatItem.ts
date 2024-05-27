export enum ChatItemRole {
  User = 0,
  Assistant = 1,
}

export enum ChatItemState {
  Waiting = 0,
  Generating = 1,
  Stoped = 2,
  Failed = 3,
}

export enum MessageType {
  Text = 0,
  Image = 1,
  Audio = 2,
  Video = 3,
  File = 4,
}

export interface ChatItem {
  id: string;
  timestamp: number;
  content: string;
  messageType: MessageType;
  role: ChatItemRole;
  state: ChatItemState;
  sessionId: string;
  errorMsg?: string;
}

export function cloneChatItem(chatItem: ChatItem): ChatItem {
  return {
    id: chatItem.id,
    timestamp: chatItem.timestamp,
    content: chatItem.content,
    messageType: chatItem.messageType,
    role: chatItem.role,
    state: chatItem.state,
    sessionId: chatItem.sessionId,
    errorMsg: chatItem.errorMsg,
  };
}

// 定义集合
export const chatItemSchema = {
  title: "chatItem schema",
  version: 0,
  type: "object",
  properties: {
    id: {
      type: "string",
      primary: true,
      maxLength: 36,
    },
    timestamp: {
      type: "interger",
    },
    content: {
      type: "string",
    },
    messageType: {
      type: "interger",
    },
    role: {
      type: "interger",
    },
    state: {
      type: "interger",
    },
    sessionId: {
      type: "string",
    },
    errorMsg: {
      type: "string",
    },
  },
  primaryKey: "id",
  required: [
    "timestamp",
    "content",
    "messageType",
    "role",
    "state",
    "sessionId",
  ],
};
