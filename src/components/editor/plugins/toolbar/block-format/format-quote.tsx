import { $getSelection } from "lexical";
import { useTranslation } from "react-i18next";
import { $setBlocksType } from "@lexical/selection";
import { $createQuoteNode } from "@lexical/rich-text";

import { SelectItem } from "@/components/ui/select";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { blockTypeToBlockName } from "@/components/editor/plugins/toolbar/block-format/block-format-data";

const BLOCK_FORMAT_VALUE = "quote";

export function FormatQuote() {
  const { t } = useTranslation("notes", { keyPrefix: "editor.blocks" });
  const { activeEditor, blockType } = useToolbarContext();

  const formatQuote = () => {
    if (blockType !== "quote") {
      activeEditor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  return (
    <SelectItem value={BLOCK_FORMAT_VALUE} onPointerDown={formatQuote}>
      <div className="flex items-center gap-1 font-normal">
        {blockTypeToBlockName[BLOCK_FORMAT_VALUE].icon}
        {t(blockTypeToBlockName[BLOCK_FORMAT_VALUE].key)}
      </div>
    </SelectItem>
  );
}
