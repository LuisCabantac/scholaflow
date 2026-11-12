import { $getSelection } from "lexical";
import { useTranslation } from "react-i18next";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, type HeadingTagType } from "@lexical/rich-text";

import { SelectItem } from "@/components/ui/select";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { blockTypeToBlockName } from "@/components/editor/plugins/toolbar/block-format/block-format-data";

export function FormatHeading({ levels = [] }: { levels: HeadingTagType[] }) {
  const { t } = useTranslation("notes", { keyPrefix: "editor.blocks" });
  const { activeEditor, blockType } = useToolbarContext();

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      activeEditor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  return levels.map((level) => (
    <SelectItem
      key={level}
      value={level}
      onPointerDown={() => formatHeading(level)}
    >
      <div className="flex items-center gap-1 font-normal">
        {blockTypeToBlockName[level].icon}
        {t(blockTypeToBlockName[level].key)}
      </div>
    </SelectItem>
  ));
}
