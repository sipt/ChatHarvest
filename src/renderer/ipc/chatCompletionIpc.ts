import { ipcRenderer } from "electron";
import { ChatItem } from "../models/ChatItem";
import { Server } from "../models/Server";
import { Session } from "../models/Session";
import { Subject } from "rxjs";
import { OpenAI } from "openai";

class ChatCompletionIpc {
  private pool: Map<
    string,
    Subject<OpenAI.Chat.Completions.ChatCompletionChunk>
  > = new Map();

  constructor() {
    this.receive();
  }

  async createStream(server: Server, session: Session, chatItems: ChatItem[]) {
    ipcRenderer.send("chat.completion.stream", server, session, chatItems);
    if (!this.pool.has(session.id)) {
      this.pool.set(
        session.id,
        new Subject<OpenAI.Chat.Completions.ChatCompletionChunk>(),
      );
    }
    return this.pool.get(session.id);
  }

  receive() {
    ipcRenderer.on(
      "chat.completion.receive",
      (
        event,
        sessionId: string,
        chunk: OpenAI.Chat.Completions.ChatCompletionChunk,
        error,
      ) => {
        if (this.pool.has(sessionId)) {
          if (error) {
            this.pool.get(sessionId).error(error);
          } else {
            this.pool.get(sessionId).next(chunk);
            if (chunk.choices[0].finish_reason === "stop") {
              this.pool.get(sessionId).complete();
              this.pool.delete(sessionId);
            }
          }
        }
      },
    );
  }

  cancel(sessionId: string) {
    ipcRenderer.send("chat.completion.cancel", sessionId);
    this.pool.get(sessionId).complete();
    this.pool.delete(sessionId);
  }
}

const chatCompletionIpc = new ChatCompletionIpc();
export default chatCompletionIpc;
