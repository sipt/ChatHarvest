import ToolbarItem, { ToolbarItemProps } from "./toolbarItem";

export interface ToolbarProps {
  items: ToolbarItemProps[];
  activeTab: string;
  onClick?: (id: string) => void;
}

function Toolbar(props: ToolbarProps) {
  const handleClick = (id: string) => {
    props.onClick && props.onClick(id);
  };

  return (
    <div className="window-drag flex w-full justify-center border-b border-toolbar-divider-light bg-toolbar-bg-light p-2 dark:border-toolbar-divider-dark dark:bg-toolbar-bg-dark">
      {props.items.map((item, index) => (
        <ToolbarItem
          key={index}
          {...item}
          onClick={handleClick}
          activeId={props.activeTab}
        />
      ))}
    </div>
  );
}

export default Toolbar;
