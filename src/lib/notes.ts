import type { Note } from "@/lib/schema";
import type { SplitNotes } from "@/types/notes";

type LexicalText = { text?: string };
type LexicalBlock = { type?: string; children?: LexicalText[] };

function truncate(text: string, limit: number): string {
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

export function notePreview(
  content: string | null | undefined,
  limit = 250,
): string {
  if (!content) return "";

  try {
    const state = JSON.parse(content) as {
      root?: { children?: LexicalBlock[] };
    };
    const blocks = state.root?.children;
    if (!Array.isArray(blocks)) return truncate(content, limit);

    const text = blocks
      .map((block) =>
        (block.children ?? []).map((child) => child.text ?? "").join(""),
      )
      .join("\n");

    return truncate(text, limit);
  } catch {
    return truncate(content, limit);
  }
}

export function splitPinned(notes: Note[] | null | undefined): SplitNotes {
  const list = notes ?? [];

  return {
    pinned: list.filter((note) => note.isPinned),
    others: list.filter((note) => !note.isPinned),
  };
}
