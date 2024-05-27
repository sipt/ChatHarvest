import IconFont from "../icons/iconFont";

interface ImageCellProps {
  index: number;
  content: string;
  url: string;
  removeImage: (index: number) => void;
}

function ImageCell(props: ImageCellProps) {
  <div className="relative h-[100px] w-[100px] overflow-hidden rounded-md">
    <img
      src={props.url || props.content}
      alt="Image"
      className="absolute inset-0 h-full w-full object-cover"
    />
    <button
      className="absolute right-0 top-0 h-[20px] w-[20px] rounded-full bg-theme-light font-icon text-[13px] font-bold leading-[20px] text-white active:bg-theme-light/50 active:text-white/50 dark:bg-theme-dark dark:active:bg-theme-dark/50"
      onClick={(e) => {
        e.preventDefault();
        props.removeImage(props.index);
      }}
    >
      {IconFont.TrashCircleFill}
    </button>
  </div>;
}

export default ImageCell;
