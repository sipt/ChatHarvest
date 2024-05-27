export interface TabProps {
  label: string;
  activeTab: string;
  onClick: (label: string) => void;
}

function Tab({ label, activeTab, onClick }: TabProps) {
  return (
    <span
      className={[
        "px-2 rounded cursor-default text-sm",
        activeTab === label
          ? "bg-tab-active-light dark:bg-tab-active-dark"
          : "active:bg-tab-active-light active:dark:bg-tab-active-dark",
      ].join(" ")}
      onClick={(e) => {
        e.preventDefault();
        onClick(label);
      }}
    >
      {label}
    </span>
  );
}

export default Tab;
