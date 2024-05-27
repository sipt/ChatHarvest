export interface ToolbarItemProps {
  icon: string;
  title: string;
  id: string;
  activeId: string;
  onClick: (id: string) => void;
}

function ToolbarItem(props: ToolbarItemProps) {
  return (
    <div
      className={
        "window-nodrag ml-2 flex cursor-default select-none flex-col items-center rounded-lg px-2 py-1 text-secondary-light active:bg-toolbar-button-active-light active:text-primary-light dark:text-secondary-dark dark:active:bg-toolbar-button-active-dark dark:active:text-primary-dark" +
        (props.id === props.activeId
          ? " bg-toolbar-button-active-light text-theme-light dark:bg-toolbar-button-active-dark dark:text-theme-dark"
          : " hover:bg-toolbar-button-hover-light dark:hover:bg-toolbar-button-hover-dark")
      }
      onClick={() => {
        props.onClick(props.id);
      }}
    >
      <span className="font-icon text-xl font-normal">{props.icon}</span>
      <span className="text-sm font-medium">{props.title}</span>
    </div>
  );
}

export default ToolbarItem;
