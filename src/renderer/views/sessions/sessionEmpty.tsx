import IconFont from "../icons/iconFont";

function SessionEmpty() {
  return (
    <div className="flex flex-col items-end text-stone-200 dark:text-stone-950/70">
      <div className="mr-2 h-[40px] w-[40px] rotate-90">
        <span className="font-icon text-[30px] ">
          {IconFont.ArrowShapeLeftFill}
        </span>
      </div>
      <div className="mr-2 text-[20px] font-bold">
        <span>Click to start Chat</span>
      </div>
    </div>
  );
}

export default SessionEmpty;
