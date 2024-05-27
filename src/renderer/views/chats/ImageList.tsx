import IconFont from "../icons/iconFont";
import * as ScrollArea from "@radix-ui/react-scroll-area";

interface ImageListProps {
  images: ImageSource[];
  updateImages: (images: ImageSource[]) => void;
}

export interface ImageSource {
  content?: string;
  url?: string;
}

function ImageList(props: ImageListProps) {
  return (
    <ScrollArea.Root
      className="h-full w-full grow overflow-hidden py-2 data-[orientation=horizontal]:h-[10px] data-[orientation=vertical]:w-[10px] data-[orientation=horizontal]:flex-col"
      type="always"
    >
      <ScrollArea.Viewport className="h-full w-full rounded">
        <div className="flex flex-nowrap gap-2">
          {props.images.map((v, i) => (
            <div
              key={i}
              className="relative min-h-[100px] min-w-[100px] overflow-hidden rounded-md"
            >
              <img
                src={v.url || v.content}
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <button
                className="absolute right-0 top-0 h-[20px] w-[20px] rounded-full bg-secondary-light/50 font-icon text-[13px] font-bold leading-[20px] 
                text-primary-light/50 active:bg-secondary-light/90 dark:bg-stone-500 dark:text-stone-100 active:dark:bg-stone-700"
                onClick={(e) => {
                  e.preventDefault();
                  props.updateImages(
                    props.images.filter((_, index) => index !== i),
                  );
                }}
              >
                {IconFont.XMark}
              </button>
            </div>
          ))}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="flex h-[10px] -translate-y-1 touch-none select-none p-0.5 transition-colors"
        orientation="horizontal"
      >
        <ScrollArea.Thumb className="relative rounded-[10px] bg-black/10 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] dark:bg-white/10 dark:active:bg-white/20" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

export default ImageList;
