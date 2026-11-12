import { useState } from "react";
import { useTranslation } from "react-i18next";
import { $isTableSelection } from "@lexical/table";
import {
  $isRangeSelection,
  type BaseSelection,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  type LucideIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";

import type { FontFormat } from "@/types/editor";

import { Toggle } from "@/components/ui/toggle";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";

const icons: Record<FontFormat, LucideIcon> = {
  bold: BoldIcon,
  italic: ItalicIcon,
  underline: UnderlineIcon,
  strikethrough: StrikethroughIcon,
  code: CodeIcon,
};

export function FontFormatToolbarPlugin({ format }: { format: FontFormat }) {
  const { t } = useTranslation("notes", { keyPrefix: "editor.format" });
  const { activeEditor } = useToolbarContext();

  const [isSelected, setIsSelected] = useState<boolean>(false);

  const Icon = icons[format];

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      setIsSelected(selection.hasFormat(format));
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  return (
    <Toggle
      aria-label={t(format)}
      variant="outline"
      size="sm"
      className="rounded-xl"
      defaultPressed={isSelected}
      pressed={isSelected}
      onPressedChange={setIsSelected}
      onClick={() => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
      }}
    >
      <Icon className="h-4 w-4" />
    </Toggle>
  );
}
