import { cn } from "cn";
import type { ComponentProps, Dispatch, Ref, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ColorPickerProps = Omit<
  ComponentProps<typeof Button>,
  "value" | "onChange" | "onBlur"
> & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onSetOpen: Dispatch<SetStateAction<boolean>>;
  ref?: Ref<HTMLInputElement>;
};

export function ColorPicker({
  disabled,
  value,
  onChange,
  onBlur,
  name,
  className,
  onSetOpen,
  ref,
  ...props
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const parsedValue = useMemo(() => value || "#FFFFFF", [value]);

  function handleOpenChange(openState: boolean) {
    setOpen(openState);
    onSetOpen(openState);
  }

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
        <Button
          {...props}
          className={cn("block", className)}
          name={name}
          onClick={() => handleOpenChange(true)}
          size="icon"
          style={{ backgroundColor: parsedValue }}
          variant="outline"
        >
          <div />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[1100] w-full rounded-xl">
        <HexColorPicker color={parsedValue} onChange={onChange} />
        <Input
          maxLength={7}
          onChange={(e) => onChange(e.currentTarget.value)}
          ref={ref}
          value={parsedValue}
        />
      </PopoverContent>
    </Popover>
  );
}
