import { Server, ServerType } from "@/renderer/models/Server";
import TabView from "@/renderer/views/tab/tabView";
import TabPanel from "@/renderer/views/tab/tabPanel";
import BSelect from "@/renderer/views/select/select";
import { ServerDocument, getDatabase } from "@/renderer/models/BubbleDatabase";
import DebouncedInput from "@/renderer/views/input/debouncedInput";
import DebouncedTextarea from "@/renderer/views/input/debouncedTextarea";
import { useEffect, useState } from "react";
import openAIService from "@/renderer/network/openai";

export interface ServerDetailProps {
  serverId: string;
}

function ServerDetail({ serverId }: ServerDetailProps) {
  const [server, setServer] = useState<ServerDocument | null>(null);
  const [inTesting, setInTesting] = useState<boolean>(false);
  useEffect(() => {
    let subs: any;
    if (!serverId) {
      setServer(null);
      return;
    }
    getDatabase().then((db) => {
      subs = db.servers.findOne(serverId).$.subscribe((s) => {
        setServer(s);
      });
    });
    return () => subs && subs.unsubscribe();
  }, [serverId]);

  const getStatusClass = () => {
    switch (server?.status) {
      case "available":
        return "bg-green-600 ring-green-300 dark:bg-green-500 dark:ring-green-200";
      case "pending":
        return "bg-gray-600 ring-gray-300 dark:bg-gray-500 dark:ring-gray-200";
      case "unavailable":
        return "bg-red-600 ring-red-300 dark:bg-red-500 dark:ring-red-200";
      default:
        return "bg-gray-600 ring-gray-300 dark:bg-gray-500 dark:ring-gray-200";
    }
  };

  const handleUpdate = (id: string, field: keyof Server, value: any) => {
    getDatabase().then((db) => {
      if (!db.servers) return;
      db.servers
        .findOne(id)
        .update({ $set: { [field]: value } })
        .then(() => {})
        .catch((error) => {
          console.error(`Failed to update ${field}:`, error);
        });
    });
  };

  const testServer = async () => {
    if (!server.key) {
      window.settingsIpc.alert(
        "error",
        "Test Connection Failed",
        "API Key is empty!",
      );
      handleUpdate(server.id, "status", "unavailable");
      return;
    }
    if (server.typ === ServerType.azure) {
      if (!server.apiVersion) {
        handleUpdate(server.id, "status", "unavailable");
        return;
      }
      if (!server.path) {
        handleUpdate(server.id, "status", "unavailable");
        return;
      }
    }
    setInTesting(true);
    try {
      const resp = await openAIService.testServer(server);
      if (resp.choices && resp.choices.length > 0) {
        handleUpdate(server.id, "status", "available");
      }
    } catch (err) {
      console.error(err.message);
      handleUpdate(server.id, "status", "unavailable");
      window.settingsIpc.alert("error", "Test Connection Failed", err.message);
    } finally {
      setInTesting(false);
    }
  };

  const fetchModels = async () => {
    if (!server) return;
    if (!server.key) {
      window.settingsIpc.alert(
        "error",
        "Test Connection Failed",
        "API Key is empty!",
      );
      handleUpdate(server.id, "status", "unavailable");
      return;
    }
    if (server.typ === ServerType.openAI) {
      const models = await openAIService.fetchModels(server);
      if (models.length > 0) {
        var ids = models.map((model) => {
          return model.id;
        });
        if (ids.length > 0) {
          ids = ids.filter((id) => id.startsWith("gpt-"));
          console.log(ids);
          handleUpdate(server.id, "models", ids);
        }
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <TabView>
        <TabPanel label="Provider Infomation">
          {server !== null ? (
            <div className="flex cursor-default select-none flex-col gap-3 p-7 text-sm">
              <div className="flex grow flex-row items-center gap-3">
                <div className="w-24 text-right">Status:</div>
                <div className="flex flex-row items-center gap-3">
                  <div
                    className={
                      "h-[10px] w-[10px] rounded-full ring-2 " +
                      getStatusClass()
                    }
                  ></div>
                  {inTesting ? (
                    <div className="flex h-4 items-center justify-center rounded bg-control-button-active-light px-2 dark:bg-control-button-active-dark">
                      <span>Testing...</span>
                    </div>
                  ) : (
                    <div
                      className="flex h-4 items-center justify-center rounded bg-control-button-normal-light px-2 active:bg-control-button-active-light dark:bg-control-button-normal-dark dark:active:bg-control-button-active-dark"
                      onClick={(e) => {
                        e.preventDefault();
                        testServer();
                      }}
                    >
                      <span>Test Connection</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex grow flex-row items-center gap-3">
                <div className="w-24 text-right">Name:</div>
                <DebouncedInput
                  className="h-5 grow rounded border border-border-light bg-input-bg-light px-1 leading-5 outline-none dark:border-border-dark dark:bg-input-bg-dark"
                  value={server.name}
                  debouncedMs={200}
                  debouncedOnChange={(value) => {
                    getDatabase().then((db) => {
                      db.servers
                        .findOne(server.id)
                        .update({ $set: { name: value } });
                    });
                  }}
                />
              </div>
              <div className="flex grow flex-row gap-3">
                <div className="w-24 text-right">Provider:</div>
                <BSelect
                  defaultValue={"OpenAI"}
                  value={server.typ}
                  options={[
                    { value: ServerType.openAI, label: ServerType.openAI },
                    { value: ServerType.azure, label: ServerType.azure },
                  ]}
                  onValueChange={async (value) => {
                    const db = await getDatabase();
                    await db.servers
                      .findOne(server.id)
                      .update({ $set: { typ: value as ServerType } });
                  }}
                />
              </div>
              <div className="flex grow flex-row items-center gap-3">
                <div className="w-24 text-right">API URL:</div>
                <DebouncedInput
                  className="grow rounded border border-border-light bg-input-bg-light px-1 outline-none dark:border-border-dark dark:bg-input-bg-dark"
                  value={server.path}
                  debouncedMs={200}
                  placeholder={
                    server.typ === ServerType.openAI
                      ? "https://api.openai.com/v1"
                      : "https://${resource}.openai.azure.com/openai/deployments/${model}"
                  }
                  debouncedOnChange={(value) => {
                    getDatabase().then((db) => {
                      db.servers
                        .findOne(server.id)
                        .update({ $set: { path: value, status: "pending" } });
                    });
                  }}
                />
              </div>
              <div className="flex grow flex-row items-center gap-3">
                <div className="w-24 text-right">API Key:</div>
                <DebouncedInput
                  className="grow rounded border border-border-light bg-input-bg-light px-1 outline-none dark:border-border-dark dark:bg-input-bg-dark"
                  value={server.key}
                  debouncedMs={200}
                  debouncedOnChange={(value) => {
                    getDatabase().then((db) => {
                      db.servers
                        .findOne(server.id)
                        .update({ $set: { key: value, status: "pending" } });
                    });
                  }}
                />
              </div>
              {server.typ === ServerType.azure && (
                <div className="flex grow flex-row items-center gap-3">
                  <div className="w-24 text-right">API Version:</div>
                  <DebouncedInput
                    className="grow rounded border border-border-light bg-input-bg-light px-1 outline-none dark:border-border-dark dark:bg-input-bg-dark"
                    value={server.apiVersion}
                    debouncedMs={200}
                    debouncedOnChange={(value) => {
                      getDatabase().then((db) => {
                        db.servers.findOne(server.id).update({
                          $set: { apiVersion: value, status: "pending" },
                        });
                      });
                    }}
                  />
                </div>
              )}
              <div className="border-b border-border-light px-7 dark:border-border-dark"></div>
              <div className="flex grow flex-row items-center gap-3">
                <div className="w-24 text-right">Default Model:</div>
                <BSelect
                  defaultValue={server.models[0]}
                  value={server.model}
                  onValueChange={async (value) => {
                    const db = await getDatabase();
                    await db.servers
                      .findOne(server.id)
                      .update({ $set: { model: value } });
                  }}
                  options={server.models.map((model) => {
                    return { value: model, label: model };
                  })}
                ></BSelect>
              </div>
              {server.typ === ServerType.openAI && (
                <div className="flex grow flex-row items-center gap-3">
                  <div className="w-24 text-right"></div>
                  <div
                    className="flex h-4 items-center justify-center rounded bg-control-button-normal-light px-2 active:bg-control-button-active-light dark:bg-control-button-normal-dark dark:active:bg-control-button-active-dark"
                    onClick={(e) => {
                      e.preventDefault();
                      fetchModels();
                    }}
                  >
                    <span>Fetch Models</span>
                  </div>
                </div>
              )}
              <div className="flex grow flex-row gap-3">
                <div className="w-24 text-right">Default Prompt:</div>
                <DebouncedTextarea
                  rows={8}
                  className="grow resize-none rounded border border-border-light bg-input-bg-light px-1 outline-none dark:border-border-dark dark:bg-input-bg-dark"
                  value={server.defaultPrompt}
                  debouncedMs={200}
                  debouncedOnChange={(value) => {
                    getDatabase().then((db) => {
                      db.servers
                        .findOne(server.id)
                        .update({ $set: { defaultPrompt: value } });
                    });
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex grow items-center justify-center pt-16 text-[1.5rem] text-secondary-light/50 dark:text-secondary-dark/50">
              Select a server
            </div>
          )}
        </TabPanel>
      </TabView>
    </div>
  );
}

export default ServerDetail;
