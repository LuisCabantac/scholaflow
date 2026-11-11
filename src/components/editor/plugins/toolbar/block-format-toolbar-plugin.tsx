import { useTranslation } from "react-i18next";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isListNode, ListNode } from "@lexical/list";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import {
  $isRangeSelection,
  $isRootOrShadowRoot,
  type BaseSelection,
} from "lexical";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
} from "@/components/ui/select";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";
import { blockTypeToBlockName } from "@/components/editor/plugins/toolbar/block-format/block-format-data";

export function BlockFormatDropDown({
  children,
  onDropdownStateChange,
  onSafeInteraction,
}: {
  children: ReactNode;
  onDropdownStateChange: Dispatch<SetStateAction<boolean>>;
  onSafeInteraction: (duration?: number) => void;
}) {
  const { t } = useTranslation("notes", { keyPrefix: "editor.blocks" });
  const { activeEditor, blockType, setBlockType } = useToolbarContext();

  function $updateToolbar(selection: BaseSelection) {
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }
    }
  }

  useUpdateToolbarHandler($updateToolbar);

  return (
    <Select
      value={blockType}
      onValueChange={(value) => {
        setBlockType(value as keyof typeof blockTypeToBlockName);
      }}
      onOpenChange={(open) => {
        onDropdownStateChange?.(open);
        onSafeInteraction?.(500);
      }}
    >
      <SelectTrigger
        className="h-8! w-min gap-1 rounded-xl"
        onClick={(e) => {
          e.stopPropagation();
          onSafeInteraction?.(500);
        }}
      >
        {blockTypeToBlockName[blockType].icon}
        <span>{t(blockTypeToBlockName[blockType].key)}</span>
      </SelectTrigger>
      <SelectContent className="z-9999 rounded-xl">
        <SelectGroup>{children}</SelectGroup>
      </SelectContent>
    </Select>
  );
}
