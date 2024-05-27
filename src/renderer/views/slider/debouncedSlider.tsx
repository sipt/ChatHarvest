import * as Slider from "@radix-ui/react-slider";
import { useEffect, useRef, useState } from "react";
import { Subject, debounceTime } from "rxjs";

export interface DebouncedSliderProps extends Slider.SliderProps {
  debouncedOnChange: (value: number[]) => void;
  debouncedMs: number;
}

function DebouncedSlider({
  debouncedOnChange,
  debouncedMs,
  ...props
}: DebouncedSliderProps) {
  const inputSubject = useRef(new Subject<number[]>());
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    const subscription = inputSubject.current
      .pipe(debounceTime(debouncedMs))
      .subscribe((value) => {
        debouncedOnChange(value);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [debouncedOnChange, debouncedMs]);

  const handleChange = (vs: number[]) => {
    setValue(vs);
    inputSubject.current.next(vs);
  };
  return (
    <div className="flex flex-row">
      <span className="text-xs w-[30px] text-center leading-5 text-primary-light dark:text-primary-dark">
        {value.join("-")}
      </span>
      <Slider.Root
        className="relative flex h-5 w-[200px] touch-none select-none items-center"
        {...props}
        value={value}
        onValueChange={handleChange}
      >
        <Slider.Track className=" relative h-[3px] grow rounded-full bg-slider-track-light dark:bg-slider-track-dark">
          <Slider.Range className="absolute h-full rounded-full bg-theme-light dark:bg-theme-dark" />
        </Slider.Track>
        <Slider.Thumb
          className="block h-4 w-4 rounded-[10px] bg-slider-thumb-normal-light shadow outline-none active:bg-slider-thumb-active-light dark:bg-slider-thumb-normal-dark dark:active:bg-slider-thumb-active-dark"
          aria-label="Volume"
        />
      </Slider.Root>
    </div>
  );
}

export default DebouncedSlider;
