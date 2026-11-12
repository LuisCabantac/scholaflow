import type { Note } from "@/lib/schema";

export type NoteFormType = "create" | "edit";

export type SplitNotes = { pinned: Note[]; others: Note[] };
