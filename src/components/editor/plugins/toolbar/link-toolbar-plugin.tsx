import { LinkIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isRangeSelection,
  type BaseSelection,
  COMMAND_PRIORITY_NORMAL,
  KEY_MODIFIER_COMMAND,
} from "lexical";

import { Toggle } from "@/components/ui/toggle";
import { sanitizeUrl } from "@/components/editor/utils/url";
import { getSelectedNode } from "@/components/editor/utils/get-selected-node";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useFloatingLinkContext } from "@/components/editor/context/floating-link-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";

export function LinkToolbarPlugin() {
  const { t } = useTranslation("notes", { keyPrefix: "editor" });
  const { activeEditor } = useToolbarContext();
  const { setIsLinkEditMode } = useFloatingLinkContext();

  const [isLink, setIsLink] = useState(false);

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));
    }
  };

  useUpdateToolbarHandler($updateToolbar);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === "KeyK" && (ctrlKey || metaKey)) {
          event.preventDefault();
          let url: string | null;
          if (!isLink) {
            setIsLinkEditMode(true);
            url = sanitizeUrl("https://");
          } else {
            setIsLinkEditMode(false);
            url = null;
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [activeEditor, isLink, setIsLinkEditMode]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://"),
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, isLink, setIsLinkEditMode]);

  return (
    <Toggle
      variant="outline"
      size="sm"
      className="h-8! w-8! rounded-xl"
      aria-label={t("link")}
      onClick={insertLink}
    >
      <LinkIcon className="h-4 w-4" />
    </Toggle>
  );
}
