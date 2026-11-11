import type { ComponentProps, Dispatch, Ref, SetStateAction } from "react";

import type { Button } from "@/components/ui/button";

export type ColorPickerProps = Omit<
  ComponentProps<typeof Button>,
  "value" | "onChange" | "onBlur"
> & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onSetOpen: Dispatch<SetStateAction<boolean>>;
  ref?: Ref<HTMLInputElement>;
};
