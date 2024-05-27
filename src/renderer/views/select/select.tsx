import {
  Root,
  Trigger,
  Portal,
  Content,
  Group,
  Viewport,
  Value,
  Icon,
  SelectProps,
  ItemIndicator,
  Item,
  ItemText,
} from "@radix-ui/react-select";
import {
  ForwardedRef,
  ReactNode,
  forwardRef,
  useEffect,
  useState,
} from "react";
import IconFont from "../icons/iconFont";

export interface BSelectProps extends SelectProps {
  options: BOptionProps[];
}

export interface BOptionProps {
  label: string;
  value: string;
}

function BSelect(props: BSelectProps) {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  return (
    <Root
      {...props}
      value={value}
      onValueChange={(v) => {
        setValue(v);
        props.onValueChange?.(v);
      }}
    >
      <Trigger
        className="inline-flex h-5 w-20 grow cursor-default items-center justify-between gap-2 rounded border border-border-light bg-input-bg-light pl-2 pr-1 outline-none dark:border-border-dark dark:bg-input-bg-dark"
        aria-label="Food"
      >
        <Value />
        <Icon className="font-icon">
          <div className="flex h-[15px] w-[15px] items-center justify-center rounded bg-theme-light text-[10px] dark:bg-theme-dark">
            <span>{IconFont.ChevronUpDown}</span>
          </div>
        </Icon>
      </Trigger>
      <Portal>
        <Content className="window-nodrag z-20 rounded-md border border-border-light bg-box-bg-light shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] dark:border-border-dark dark:bg-box-bg-dark">
          <Viewport className="p-1">
            <Group className="">
              {props.options.map((option, index) => (
                <SelectItem value={option.value} key={index}>
                  {option.label}
                </SelectItem>
              ))}
            </Group>
          </Viewport>
        </Content>
      </Portal>
    </Root>
  );
}

export interface SelectItemProps {
  children: ReactNode;
  className?: string;
  // 可以添加更多props的类型定义，这里假设它接受所有标准的HTML属性
  [key: string]: any;
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  (
    { children, className, ...props },
    forwardedRef: ForwardedRef<HTMLDivElement>,
  ) => {
    return (
      <Item
        className={[
          "text-violet11 relative flex h-5 select-none items-center rounded-[3px] pl-6 pr-2 text-sm leading-none outline-none hover:bg-list-select-light dark:hover:bg-list-select-dark",
          className,
        ].join(" ")}
        {...props}
        ref={forwardedRef}
      >
        <ItemText>{children}</ItemText>
        <ItemIndicator className="absolute left-0 inline-flex w-5 items-center justify-center font-icon">
          <span>{IconFont.Checkmark}</span>
        </ItemIndicator>
      </Item>
    );
  },
);

// const SelectItem = forwardRef(
//   ({ children, className, ...props }, forwardedRef) => {
//     return (
//       <Item
//         className={[
//           "leading-none text-violet11 rounded-[3px] flex items-center h-5 pr-2 pl-6 relative select-none text-sm hover:bg-list-select-light dark:hover:bg-list-select-dark",
//           className,
//         ].join(" ")}
//         {...props}
//         ref={forwardedRef}
//       >
//         <ItemText>{children}</ItemText>
//         <ItemIndicator className="absolute left-0 w-5 inline-flex items-center justify-center ">
//           <span>􀆅</span>
//         </ItemIndicator>
//       </Item>
//     );
//   }
// );

export default BSelect;
