import React, { MouseEventHandler } from "react";
import IconFont from "../icons/iconFont";
export default function CodeCopyBtn({
  children,
}: {
  children: React.ReactElement;
}) {
  const [copyOk, setCopyOk] = React.useState(false);
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    navigator.clipboard.writeText(children.props.children);
    setCopyOk(true);
    setTimeout(() => {
      setCopyOk(false);
    }, 500);
  };
  return (
    <div className="relative h-0">
      <button
        className="absolute right-3 top-3 z-[1] select-none font-icon text-base text-secondary-light active:text-primary-light/50 dark:text-secondary-dark dark:active:text-primary-dark/50"
        onClick={handleClick}
      >
        {IconFont.DocOnDoc}
      </button>
    </div>
  );
}
