import React, { useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

export interface DebouncedInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  debouncedOnChange: (value: string) => void;
  debouncedMs: number;
}

function DebouncedTextarea({
  debouncedMs,
  debouncedOnChange,
  ...props
}: DebouncedInputProps) {
  const inputSubject = useRef(new Subject<string>());
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
  }, []);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
    inputSubject.current.next(event.target.value);
  };

  return <textarea {...props} onChange={handleChange} value={value} />;
}

export default DebouncedTextarea;
