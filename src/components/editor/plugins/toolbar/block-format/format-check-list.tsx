import { useTranslation } from "react-i18next";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_CHECK_LIST_COMMAND } from "@lexical/list";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";

import { SelectItem } from "@/components/ui/select";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { blockTypeToBlockName } from "@/components/editor/plugins/toolbar/block-format/block-format-data";

const BLOCK_FORMAT_VALUE = "check";

export function FormatCheckList() {
  const { t } = useTranslation("notes", { keyPrefix: "editor.blocks" });
  const { activeEditor, blockType } = useToolbarContext();

  const formatParagraph = () => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatCheckList = () => {
    if (blockType !== "number") {
      activeEditor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onPointerDown={formatCheckList}>
      <div className="flex items-center gap-1 font-normal">
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE].icon}
        {t(blockTypeToBlockName[BLOCK_FORMAT_VALUE].key)}
      </div>
    </SelectItem>
  );
}
