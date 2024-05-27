import { ReactNode } from "react";

export interface TabPanelProps {
  label: string;
  children: ReactNode;
}

function TabPanel({ children }: TabPanelProps) {
  return <div>{children}</div>;
}

export default TabPanel;
