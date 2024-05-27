import { useEffect, useState } from "react";
import { Server, ServerType, defaultModels } from "@/renderer/models/Server";
import ServerItem from "./serverItem";
import ServerDetail from "./serverDetail";
import { getDatabase } from "@/renderer/models/BubbleDatabase";
import { v4 as uuid } from "uuid";
import IconFont from "../../icons/iconFont";

function ServerSetting() {
  const [selectedId, setSelectedId] = useState("");
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    let subs: any;

    getDatabase().then((db) => {
      if (!db.servers) return;
      subs = db.servers
        .find({ sort: [{ timestamp: "asc" }] })
        .$.subscribe((servers) => {
          if (servers) {
            setServers(servers);
            if (servers.length > 0) {
              setSelectedId((pre) => {
                if (pre === "") {
                  return servers[0].id;
                } else {
                  return pre;
                }
              });
            }
          }
        });
    });

    // 取消订阅
    return () => subs && subs.unsubscribe();
  }, []);

  const addServer = async () => {
    const db = await getDatabase();
    const server = {
      id: uuid(),
      name: "Default Server",
      timestamp: new Date().getTime(),
      typ: ServerType.openAI,
      model: "gpt-3.5-turbo",
      models: defaultModels,
      defaultPrompt: "You are a helpful assistant.",
      path: "",
      key: "",
      apiVersion: "",
      status: "pending",
    } as Server;
    setSelectedId(server.id);
    await db.servers.insert(server);
  };

  const deleteServer = async () => {
    const db = await getDatabase();
    await db.servers.findOne(selectedId).remove();
    setSelectedId("");
  };

  return (
    <div className="flex grow flex-row">
      <div className="flex h-full w-48 flex-col">
        <div className="flex grow flex-col border border-border-light dark:border-border-dark">
          {servers.map((server, index) => (
            <ServerItem
              server={server}
              selectedId={selectedId}
              onClick={(id) => {
                setSelectedId(id);
              }}
              key={index}
            />
          ))}
        </div>
        <div className="mt-2 flex w-fit cursor-default flex-row rounded-md border border-control-button-border-light bg-control-button-normal-light font-icon dark:border-control-button-border-dark dark:bg-control-button-normal-dark">
          <div
            className="flex h-5 w-6 items-center justify-center rounded-l-md active:bg-control-button-active-light dark:active:bg-control-button-active-dark"
            onClick={(e) => {
              e.preventDefault();
              addServer();
            }}
          >
            <span>{IconFont.Plus}</span>
          </div>
          <span className="my-1 border-l border-divider-light dark:border-divider-dark"></span>
          <div
            className="flex h-5 w-6 items-center justify-center rounded-r-md active:bg-control-button-active-light dark:active:bg-control-button-active-dark"
            onClick={(e) => {
              e.preventDefault();
              deleteServer();
            }}
          >
            <span>{IconFont.Minus}</span>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <ServerDetail serverId={selectedId} />
      </div>
    </div>
  );
}

export default ServerSetting;
