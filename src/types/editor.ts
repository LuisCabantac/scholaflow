import type { Dispatch, SetStateAction } from "react";
import type { EditorState, SerializedEditorState } from "lexical";

export type EditorProps = {
  editorState?: EditorState;
  editorSerializedState?: SerializedEditorState;
  onChange?: (editorState: EditorState) => void;
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
  onDropdownStateChange: Dispatch<SetStateAction<boolean>>;
  onSafeInteraction: (duration?: number) => void;
};

export type BlockFormatKey =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "number"
  | "bullet"
  | "check"
  | "code"
  | "quote";

export type FontFormat =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code";
