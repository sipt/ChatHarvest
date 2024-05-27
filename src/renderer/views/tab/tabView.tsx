import { useState, ReactElement, ReactNode, Fragment } from "react";
import Tab from "./tab";
import { TabPanelProps } from "./tabPanel";

export interface TabProps {
  children?: ReactElement<TabPanelProps> | ReactElement<TabPanelProps>[];
}

function TabView({ children }: TabProps) {
  const [activeTab, setActiveTab] = useState(
    (Array.isArray(children) ? children : [children])[0].props.label
  );

  const handleClick = (label: string) => {
    setActiveTab(label);
  };

  return (
    <div className="flex flex-col px-4 grow">
      <div className="flex flex-row justify-center select-none cursor-default translate-y-2">
        <div className="flex flex-row rounded justify-center bg-tab-bg-light dark:bg-tab-bg-dark shadow-sm shadow-tab-shadow-light dark:shadow-tab-shadow-dark">
          {(Array.isArray(children) ? children : [children]).map(
            (tab, index) => {
              return (
                <Fragment key={index}>
                  <Tab
                    activeTab={activeTab}
                    label={tab.props.label}
                    onClick={handleClick}
                  />
                  {index <
                    (Array.isArray(children) ? children : [children]).length -
                      1 && (
                    <span className="border-l my-1 border-tab-divider-light dark:border-tab-divider-dark"></span>
                  )}
                </Fragment>
              );
            }
          )}
        </div>
      </div>

      <div className="grow bg-box-bg-light dark:bg-box-bg-dark border rounded border-box-border-light dark:border-box-border-dark">
        {(Array.isArray(children) ? children : [children]).map((tab) => {
          if (tab.props.label !== activeTab) return undefined;
          return tab.props.children;
        })}
      </div>
    </div>
  );
}

export default TabView;
