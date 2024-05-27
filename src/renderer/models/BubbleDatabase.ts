import { RxDatabase, addRxPlugin, createRxDatabase, RxDocument } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { UserSetting, userSettingSchema } from "./UserSetting";
import { Server, serverSchema } from "./Server";
import { Session, sessionSchema } from "./Session";
import { ChatItem, chatItemSchema } from "./ChatItem";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBDevModePlugin);

let db: RxDatabase | null = null;

export async function getDatabase() {
  if (db) {
    return db;
  }
  const dbInstance = await createRxDatabase({
    name: "bubble",
    storage: getRxStorageDexie(),
    ignoreDuplicate: true,
    allowSlowCount: true,
  });
  await dbInstance.addCollections({
    servers: {
      schema: serverSchema,
    },
    user_settings: {
      schema: userSettingSchema,
    },
    sessions: {
      schema: sessionSchema,
    },
    chat_items: {
      schema: chatItemSchema,
    },
  });
  db = dbInstance;
  return db;
}

// 定义 RxDB 文档类型
export type ServerDocument = Server & RxDocument;
export type ChatItemDocument = ChatItem & RxDocument;
export type SessionDocument = Session & RxDocument;
export type UserSettingDocument = UserSetting & RxDocument;
