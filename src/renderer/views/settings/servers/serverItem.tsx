import { Server, ServerType } from "@/renderer/models/Server";
import openAI from "./openai.svg";
import azure from "./azure.svg";

interface ServerItemProps {
  server: Server;
  selectedId: string;
  onClick: (id: string) => void;
}

function ServerItem(props: ServerItemProps) {
  const icon = () => {
    switch (props.server.typ) {
      case ServerType.openAI:
        return <img src={openAI} className="h-6 w-6" />;
      case ServerType.azure:
        return <img src={azure} className="h-6 w-6" />;
    }
  };

  const getStatusClass = () => {
    switch (props.server.status) {
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
  return (
    <div
      className={[
        "flex select-none flex-row items-center px-2 py-1",
        props.selectedId === props.server.id
          ? "bg-list-select-light dark:bg-list-select-dark"
          : "",
      ].join(" ")}
      onClick={(e) => {
        e.preventDefault();
        props.onClick(props.server.id);
      }}
    >
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white">
        {icon()}
      </div>
      <div className="inline-flex w-36 flex-col overflow-hidden pl-2">
        <span
          className={[
            "grow overflow-hidden overflow-ellipsis whitespace-nowrap text-base",
            props.selectedId === props.server.id ? "text-primary-dark" : "",
          ].join(" ")}
        >
          {props.server.name}
        </span>
        <span
          className={[
            "overflow-hidden overflow-ellipsis whitespace-nowrap text-sm",
            props.selectedId === props.server.id
              ? "text-secondary-dark"
              : "text-secondary-light dark:text-secondary-dark",
          ].join(" ")}
        >
          {props.server.model}
        </span>
      </div>
      <div>
        <div
          className={
            "h-[10px] w-[10px] rounded-full ring-2 " + getStatusClass()
          }
        ></div>
      </div>
    </div>
  );
}

export default ServerItem;
