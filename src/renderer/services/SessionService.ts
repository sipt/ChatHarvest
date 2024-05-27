import {
  Observer,
  Subject,
  asyncScheduler,
  debounceTime,
  throttleTime,
} from "rxjs";
import { OpenAI } from "openai";
import { getDatabase } from "../models/BubbleDatabase";
import { v4 as uuid } from "uuid";
import { cloneServer } from "../models/Server";
import { cloneSession } from "../models/Session";
import {
  ChatItem,
  ChatItemRole,
  ChatItemState,
  MessageType,
  cloneChatItem,
} from "../models/ChatItem";
import openAIService from "../network/openai";
import { ImageSource } from "../views/chats/ImageList";

class SessionService {
  private sessionPool: Map<string, string>;
  private messagePool: Map<
    string,
    Subject<OpenAI.Chat.Completions.ChatCompletionChunk>
  >;

  constructor() {
    this.sessionPool = new Map();
    this.messagePool = new Map();
  }

  public async createSession(
    sessionId: string,
    message: string,
    imgs?: ImageSource[],
  ) {
    const db = await getDatabase();

    if (!db.sessions) return;
    const session = await db.sessions.findOne(sessionId).exec();
    if (session.inProcess) {
      return;
    }
    await session.update({ $set: { inProcess: true } });
    if (!db.servers) return;
    const server = await db.servers.findOne(session.serverId).exec();
    if (!db.chat_items) return;
    if (imgs && imgs.length > 0) {
      for (const img of imgs) {
        await db.chat_items.insert({
          id: uuid(),
          sessionId: session.id,
          content: img.content || img.url,
          messageType: MessageType.Image,
          role: ChatItemRole.User,
          state: ChatItemState.Stoped,
          timestamp: new Date().getTime(),
        });
      }
    }
    const userChatItem = {
      id: uuid(),
      sessionId: session.id,
      content: message,
      messageType: MessageType.Text,
      role: ChatItemRole.User,
      state: ChatItemState.Stoped,
      timestamp: new Date().getTime(),
    } as ChatItem;
    await db.chat_items.insert(userChatItem);
    const chatItems = await db.chat_items
      .find({
        selector: { sessionId: sessionId, state: ChatItemState.Stoped },
        sort: [{ timestamp: "desc" }],
        limit: session.limit,
      })
      .exec();
    const assistantChatItem = {
      id: uuid(),
      sessionId: session.id,
      content: "",
      messageType: MessageType.Text,
      role: ChatItemRole.Assistant,
      state: ChatItemState.Waiting,
      timestamp: new Date().getTime() + 1,
    } as ChatItem;
    await db.chat_items.insert(assistantChatItem);
    const stopProcess = async (
      sessionId: string,
      errorMsg?: string,
      content?: string,
    ) => {
      let state = ChatItemState.Stoped;
      if (errorMsg) {
        state = ChatItemState.Failed;
      }
      const db = await getDatabase();
      await db.sessions
        .findOne(sessionId)
        .update({ $set: { inProcess: false } });
      const updateFiled: any = {
        $set: {
          state: state,
        },
      };
      if (content) {
        updateFiled.$set.content = content;
      }
      if (errorMsg) {
        updateFiled.$set.errorMsg = errorMsg;
      }
      const chatId = this.sessionPool.get(sessionId);
      if (chatId) {
        await db.chat_items.findOne(chatId).update(updateFiled);
      }
      this.sessionPool.delete(sessionId);
    };
    this.sessionPool.set(sessionId, assistantChatItem.id);
    const subject = new Subject<OpenAI.Chat.Completions.ChatCompletionChunk>();
    this.messagePool.set(assistantChatItem.id, subject);
    subject
      .pipe(
        throttleTime(200, asyncScheduler, { leading: false, trailing: true }),
      )
      .subscribe({
        async next(value: OpenAI.Chat.Completions.ChatCompletionChunk) {
          if (!value) return;
          const choice = value.choices[0];
          if (choice.finish_reason) {
            switch (choice.finish_reason) {
              case "stop":
                await stopProcess(sessionId, undefined, choice.delta.content);
                return;
              case "length":
                await stopProcess(
                  sessionId,
                  "The response is too long.",
                  choice.delta.content,
                );
                return;
              default:
                await stopProcess(
                  sessionId,
                  `not support ${choice.finish_reason}.`,
                  choice.delta.content,
                );
                return;
            }
          }
          if (!choice.delta.content) return;
          await db.chat_items.findOne(assistantChatItem.id).update({
            $set: {
              content: choice.delta.content,
              state: ChatItemState.Generating,
            },
          });
        },
        async error(err: any) {
          console.error(err);
          stopProcess(sessionId, err.message);
        },
        complete() {},
      });
    openAIService
      .chatCompletion(
        cloneServer(server),
        cloneSession(session),
        chatItems.reverse().map((v) => cloneChatItem(v)),
        (chunk) => {
          subject.next(chunk);
        },
      )
      .then(() => {
        subject.complete();
      })
      .catch((err) => {
        subject.error(err);
      })
      .finally(() => {
        this.messagePool.delete(assistantChatItem.id);
      });
    return assistantChatItem.id;
  }

  public inProcess(sessionId: string): boolean {
    return this.sessionPool.has(sessionId);
  }

  public subscribeMessage(
    chatItemId: string,
    observer: Observer<OpenAI.Chat.Completions.ChatCompletionChunk>,
  ) {
    const subject = this.messagePool.get(chatItemId);
    if (!subject) return;
    return subject.subscribe(observer);
  }

  public async cancelSession(sessionId: string) {
    openAIService.cancelStream(sessionId);
    setTimeout(() => {
      this.stopProcess(sessionId, "Canceled");
    }, 100);
  }

  public async clearChatItems(sessionId: string) {
    await this.cancelSession(sessionId);
    const db = await getDatabase();
    await db.chat_items.find({ selector: { sessionId: sessionId } }).remove();
  }

  private async stopProcess(sessionId: string, errorMsg?: string) {
    let state = ChatItemState.Stoped;
    if (errorMsg) {
      state = ChatItemState.Failed;
    }
    const db = await getDatabase();
    await db.sessions.findOne(sessionId).update({ $set: { inProcess: false } });
    const chatId = this.sessionPool.get(sessionId);
    if (chatId) {
      const updateField: any = {
        $set: {
          state: state,
        },
      };
      if (errorMsg) {
        updateField.$set.errorMsg = errorMsg;
      }
      await db.chat_items.findOne(chatId).update(updateField);
    }
    this.sessionPool.delete(sessionId);
  }
}

const sessionService = new SessionService();
export default sessionService;
