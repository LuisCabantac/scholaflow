"use client";

import { Dispatch, forwardRef, SetStateAction, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";

import { cn } from "@/lib/utils";
import { useForwardedRef } from "@/lib/use-forwarded-ref";

import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onSetOpen: Dispatch<SetStateAction<boolean>>;
}

const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, "value" | "onChange" | "onBlur" | "onSetOpen"> &
    ColorPickerProps
>(
  (
    { disabled, value, onChange, onBlur, name, className, onSetOpen, ...props },
    forwardedRef,
  ) => {
    const ref = useForwardedRef(forwardedRef);
    const [open, setOpen] = useState(false);

    const parsedValue = useMemo(() => {
      return value || "#FFFFFF";
    }, [value]);

    return (
      <Popover
        onOpenChange={(openState) => {
          setOpen(openState);
          onSetOpen(openState);
        }}
        open={open}
      >
        <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
          <Button
            {...props}
            className={cn("block", className)}
            name={name}
            onClick={() => {
              setOpen(true);
              onSetOpen(true);
            }}
            size="icon"
            style={{
              backgroundColor: parsedValue,
            }}
            variant="outline"
          >
            <div />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="z-[1100] w-full rounded-xl">
          <HexColorPicker color={parsedValue} onChange={onChange} />
          <Input
            maxLength={7}
            onChange={(e) => {
              onChange(e?.currentTarget?.value);
            }}
            ref={ref}
            value={parsedValue}
          />
        </PopoverContent>
      </Popover>
    );
  },
);
ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
