import { JSX } from "react";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
};

export function ContentEditable({
  placeholder,
  className,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <LexicalContentEditable
      className={
        className ??
        `ContentEditable__root relative block min-h-72 min-h-full overflow-auto py-4 text-foreground focus:outline-none`
      }
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={
            placeholderClassName ??
            `pointer-events-none absolute left-0 top-0 select-none overflow-hidden text-ellipsis py-[18px] text-muted-foreground`
          }
        >
          {placeholder}
        </div>
      }
    />
  );
}
