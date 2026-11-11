import { useTranslation } from "react-i18next";
import type { Dispatch, SetStateAction } from "react";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin";
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote";
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading";
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph";
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin";

export function Plugins({
  onDropdownStateChange,
  onSafeInteraction,
}: {
  onDropdownStateChange: Dispatch<SetStateAction<boolean>>;
  onSafeInteraction: (duration?: number) => void;
}) {
  const { t } = useTranslation("notes", { keyPrefix: "editor" });

  return (
    <div className="relative">
      <ToolbarPlugin>
        {() => (
          <div className="vertical-align-middle sticky top-0 z-10 flex gap-2 overflow-auto">
            <BlockFormatDropDown
              onDropdownStateChange={onDropdownStateChange}
              onSafeInteraction={onSafeInteraction}
            >
              <FormatParagraph />
              <FormatHeading levels={["h1", "h2", "h3"]} />
              <FormatQuote />
            </BlockFormatDropDown>
            <FontFormatToolbarPlugin format="bold" />
            <FontFormatToolbarPlugin format="italic" />
            <FontFormatToolbarPlugin format="underline" />
            <FontFormatToolbarPlugin format="strikethrough" />
          </div>
        )}
      </ToolbarPlugin>
      <div className="relative">
        <RichTextPlugin
          contentEditable={
            <div>
              <div>
                <ContentEditable placeholder={t("placeholder")} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
    </div>
  );
}
