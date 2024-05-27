import {
  ChatItem,
  ChatItemRole,
  MessageType,
} from "@/renderer/models/ChatItem";
import {
  Server,
  ServerType,
  supportImageInputModel,
} from "@/renderer/models/Server";
import { Session } from "@/renderer/models/Session";
import "openai/shims/web";
import { ClientOptions, OpenAI } from "openai";
import { Stream } from "openai/streaming";
import * as ChatCompletionsAPI from "openai/resources/chat/completions";
import { m } from "framer-motion";

class OpenAIService {
  private streamPool: Map<
    string,
    Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
  > = new Map();

  private getOpenAI(server: Server): OpenAI {
    // new httpAgent with proxy
    const config = {
      apiKey: server.key,
      timeout: 10000,
      dangerouslyAllowBrowser: true,
    } as ClientOptions;
    if (server.path) {
      config.baseURL = server.path;
    }
    if (server.typ === ServerType.azure) {
      config.defaultQuery = { "api-version": server.apiVersion };
      config.defaultHeaders = { "api-key": server.key };
    }
    return new OpenAI(config);
  }

  async testServer(server: Server) {
    const openai = this.getOpenAI(server);
    const response = await openai.chat.completions.create({
      model: server.model,
      messages: [{ role: "user", content: "Please return ok." }],
    });
    return response;
  }

  async fetchModels(server: Server) {
    const openai = this.getOpenAI(server);
    const response = await openai.models.list();
    return response.data;
  }

  async chatCompletion(
    server: Server,
    session: Session,
    chatItems: ChatItem[],
    send: (chunk: OpenAI.Chat.Completions.ChatCompletionChunk) => void,
  ) {
    const openai = this.getOpenAI(server);
    const messages: ChatCompletionsAPI.ChatCompletionMessageParam[] = [];
    if (session.prompt && session.prompt.length > 0) {
      // replace #{today}
      const today = new Date().toLocaleDateString();
      var prompt = session.prompt.replace("#{today}", today);
      // replace #{time}
      const time = new Date().toLocaleTimeString();
      prompt = prompt.replace("#{time}", time);
      // replace #{weekday}
      const weekday = new Date().toLocaleDateString("en-US", {
        weekday: "long",
      });
      prompt = prompt.replace("#{weekday}", weekday);
      messages.push({ role: "system", content: prompt });
    } else if (server.defaultPrompt && server.defaultPrompt.length > 0) {
      messages.push({ role: "system", content: server.defaultPrompt });
    } else {
      messages.push({
        role: "system",
        content: "You are a helpful assistant.",
      });
    }
    // 取 chatItems 后 session.limit 个内容，放入 messages
    chatItems.slice(-session.limit).map((chatItem) => {
      switch (chatItem.messageType) {
        case MessageType.Text:
          messages.push({
            role: chatItem.role === ChatItemRole.User ? "user" : "assistant",
            content: chatItem.content,
          });
          break;
        case MessageType.Image:
          messages.push({
            role: chatItem.role === ChatItemRole.User ? "user" : "assistant",
            content: [
              {
                image_url: { url: chatItem.content },
                type: "image_url",
              } as ChatCompletionsAPI.ChatCompletionContentPartImage,
            ],
          } as ChatCompletionsAPI.ChatCompletionUserMessageParam);
          break;
        default:
          break;
      }
    });
    let body = {
      model: server.model,
      messages: messages,
      temperature: session.temperature,
      stream: true,
    } as ChatCompletionsAPI.ChatCompletionCreateParamsStreaming;
    // if (supportImageInputModel.includes(server.model)) {
    //   body.max_tokens = 128000;
    // }
    const stream = await openai.chat.completions.create(body);
    this.streamPool.set(session.id, stream);
    let content = "";
    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices.length > 0) {
        if (chunk.choices[0].delta) {
          if (chunk.choices[0].delta.content) {
            content += chunk.choices[0].delta.content;
          }
        } else {
          chunk.choices[0].delta = {};
        }
        chunk.choices[0].delta.content = content;
      }
      send(chunk);
    }
  }

  async cancelStream(sessionId: string) {
    if (this.streamPool.has(sessionId)) {
      this.streamPool.get(sessionId).controller.abort();
      this.streamPool.delete(sessionId);
    }
  }
}

const openAIService = new OpenAIService();
export default openAIService;
