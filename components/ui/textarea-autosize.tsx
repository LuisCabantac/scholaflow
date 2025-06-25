import * as React from "react";
import TextareaAutosizeComponent from "react-textarea-autosize";
import { cn } from "@/lib/utils";

const textareaStyles =
  "flex min-h-10 w-full rounded-xl border border-input bg-foreground/10 px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaStyles, className)}
      {...props}
    />
  );
}

function TextareaAutosize({
  className,
  ...props
}: React.ComponentProps<typeof TextareaAutosizeComponent>) {
  return (
    <TextareaAutosizeComponent
      data-slot="textarea"
      className={cn(textareaStyles, className)}
      {...props}
    />
  );
}

export { Textarea, TextareaAutosize };
