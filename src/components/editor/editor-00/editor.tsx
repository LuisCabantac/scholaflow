import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import {
  type InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";

import type { EditorProps } from "@/types/editor";

import { TooltipProvider } from "@/components/ui/tooltip";
import { nodes } from "@/components/editor/editor-00/nodes";
import { Plugins } from "@/components/editor/editor-00/plugins";
import { editorTheme } from "@/components/editor/themes/editor-theme";

const editorConfig: InitialConfigType = {
  namespace: "Editor",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error);
  },
};

export function Editor({
  editorState,
  editorSerializedState,
  onChange,
  onSerializedChange,
  onDropdownStateChange,
  onSafeInteraction,
}: EditorProps) {
  return (
    <div className="overflow-hidden">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <Plugins
            onDropdownStateChange={onDropdownStateChange}
            onSafeInteraction={onSafeInteraction}
          />
          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(state) => {
              onChange?.(state);
              onSerializedChange?.(state.toJSON());
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  );
}
