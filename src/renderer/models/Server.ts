export enum ServerType {
  openAI = "OpenAI",
  azure = "Azure",
}

export const defaultModels: string[] = [
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4-turbo",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-0125-preview",
  "gpt-4-1106-preview",
  "gpt-4-turbo-preview",
  "gpt-4-vision-preview",
  "gpt-4",
  "gpt-4-0314",
  "gpt-4-0613",
  "gpt-4-32k",
  "gpt-4-32k-0314",
  "gpt-4-32k-0613",
  "gpt-3.5-turbo-1106",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-16k",
  "gpt-3.5-turbo-0301",
  "gpt-3.5-turbo-0613",
  "gpt-3.5-turbo-16k-0613",
  // images
  "dall-e-2",
  "dall-e-3",
];

export const supportImageInputModel: string[] = [
  "gpt-4-vision-preview",
  "gpt-4o",
  "gpt-4o-2024-05-13",
];

export interface Server {
  id: string;
  timestamp: number;
  name: string;
  typ: ServerType;
  key: string;
  path: string;
  apiVersion?: string;
  model: string;
  models: string[];
  defaultPrompt: string;
  status: "pending" | "available" | "unavailable";
}

export function cloneServer(server: Server): Server {
  return {
    id: server.id,
    timestamp: server.timestamp,
    name: server.name,
    typ: server.typ,
    key: server.key,
    path: server.path,
    apiVersion: server.apiVersion,
    model: server.model,
    models: server.models,
    defaultPrompt: server.defaultPrompt,
    status: server.status,
  };
}

// 定义集合
export const serverSchema = {
  title: "server schema",
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
    name: {
      type: "string",
    },
    typ: {
      type: "string",
    },
    key: {
      type: "string",
    },
    path: {
      type: "string",
    },
    apiVersion: {
      type: "string",
    },
    model: {
      type: "string",
    },
    models: {
      type: "array",
      items: {
        type: "string",
      },
    },
    defaultPrompt: {
      type: "string",
    },
    status: {
      type: "string",
    },
  },
  primaryKey: "id",
  required: [
    "name",
    "typ",
    "key",
    "path",
    "model",
    "models",
    "defaultPrompt",
    "status",
  ],
};
