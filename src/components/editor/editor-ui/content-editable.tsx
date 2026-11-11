import type { JSX } from "react";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
}: {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
}): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        "ContentEditable__root relative block min-h-72 min-h-full overflow-auto py-4 text-foreground focus:outline-none"
      }
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            "pointer-events-none absolute top-0 left-0 overflow-hidden py-[18px] text-ellipsis text-muted-foreground select-none"
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
