import IconFont from "../icons/iconFont";
import { LogoCustomizable } from "../icons/logo";

function EmptyPanel() {
  return (
    <div className="flex grow flex-col overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="window-drag flex max-h-[52px] w-full grow flex-row justify-between border-b border-toolbar-divider-light bg-toolbar-bg-light p-2 dark:border-toolbar-divider-dark dark:bg-toolbar-bg-dark">
        <div className="flex flex-1 flex-row items-center justify-center overflow-hidden">
          <span className="ml-2 mr-2 text-secondary-light dark:text-secondary-dark">
            To:
          </span>
          <span className="w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
            {""}
          </span>
        </div>
        <div className="flex">
          {window.env.getPlatform() === "win32" && (
            <>
              <div
                className=" window-nodrag ml-3 flex cursor-default select-none flex-col items-center justify-center rounded px-3 text-secondary-light hover:bg-black/5 active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 dark:active:bg-white/10 dark:active:text-primary-dark"
                aria-label="Customise options"
                onClick={async (e) => {
                  window.mainIpc.minimize();
                }}
              >
                <span className="font-icon text-[13px] font-normal">
                  {IconFont.Minus}
                </span>
              </div>
              <div
                className="window-nodrag flex cursor-default select-none flex-col items-center justify-center rounded px-3 text-secondary-light hover:bg-black/5 active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 dark:active:bg-white/10 dark:active:text-primary-dark"
                aria-label="Customise options"
                onClick={async (e) => {
                  window.mainIpc.maximize();
                }}
              >
                <span className="font-icon text-[13px] font-normal">
                  {IconFont.Square}
                </span>
              </div>
              <div
                className="window-nodrag flex cursor-default select-none flex-col items-center justify-center rounded px-3 text-secondary-light hover:bg-red-500 hover:text-white active:bg-black/10 active:text-primary-light dark:text-secondary-dark dark:hover:bg-white/5 hover:dark:bg-red-500 dark:hover:text-white dark:active:bg-white/10 dark:active:text-primary-dark"
                aria-label="Customise options"
                onClick={async (e) => {
                  window.mainIpc.close();
                }}
              >
                <span className="font-icon text-[13px] font-normal">
                  {IconFont.XMark}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="window-nodrag flex grow select-none items-center justify-center bg-background-light dark:bg-background-dark">
        <span className="h-[70px] w-[70px]">
          <LogoCustomizable className="fill-stone-200 dark:fill-stone-950/70" />
        </span>
      </div>
    </div>
  );
}

export default EmptyPanel;
