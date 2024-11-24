import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import {
  getAllNotesBySession,
  getAllNotesBySessionQuery,
} from "@/lib/data-service";

import NotesSection from "@/components/NotesSection";

export interface INotes {
  id: string;
  author: string;
  title: string;
  description: string;
  created_at: string;
  editedAt: string;
  isPinned: boolean;
  attachment: string[];
}

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Organize your thoughts and ideas. Take notes, track progress, and enhance your understanding with this dedicated learning space.",
};

export default async function Page() {
  const session = await auth();
  if (!hasUser(session)) return redirect("/signin");

  async function handleGetAllNotes(query: string): Promise<INotes[] | null> {
    "use server";
    if (!query) {
      const notes = await getAllNotesBySession();
      return notes;
    }
    const notes = await getAllNotesBySessionQuery(query);
    return notes;
  }

  return <NotesSection onGetNotes={handleGetAllNotes} session={session} />;
}
