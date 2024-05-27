export interface Session {
  id: string;
  timestamp: number;
  emoji: string;
  name: string;
  serverId: string;
  temperature: number;
  limit: number;
  prompt: string;
  recentAt?: number;
  recentMessage?: string;
  ActivedAt?: number;
  pinnedAt?: number;
  inProcess: boolean;
}

export function cloneSession(session: Session): Session {
  return {
    id: session.id,
    timestamp: session.timestamp,
    emoji: session.emoji,
    name: session.name,
    serverId: session.serverId,
    temperature: session.temperature,
    limit: session.limit,
    prompt: session.prompt,
    recentAt: session.recentAt,
    recentMessage: session.recentMessage,
    ActivedAt: session.ActivedAt,
    pinnedAt: session.pinnedAt,
    inProcess: session.inProcess,
  };
}

// 定义集合
export const sessionSchema = {
  title: "session schema",
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
    limit: {
      type: "interger",
    },
    emoji: {
      type: "string",
    },
    name: {
      type: "string",
    },
    serverId: {
      type: "string",
    },
    recentAt: {
      type: "interger",
    },
    ActivedAt: {
      type: "boolean",
    },
    pinnedAt: {
      type: "interger",
    },
    recentMessage: {
      type: "string",
    },
    temperature: {
      type: "interger",
    },
    prompt: {
      type: "string",
    },
    inProcess: {
      type: "boolean",
    },
  },
  primaryKey: "id",
  required: [
    "timestamp",
    "limit",
    "emoji",
    "name",
    "serverId",
    "temperature",
    "prompt",
    "inProcess",
  ],
};
