import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { Note } from "@/lib/schema";
import {
  getAllNotesBySession,
  getAllNotesBySessionQuery,
} from "@/lib/notes-service";

import NotesSection from "@/components/NotesSection";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Organize your thoughts and ideas. Take notes, track progress, and enhance your understanding with this dedicated learning space.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return redirect("/signin");

  async function handleGetAllNotes(query: string): Promise<Note[] | null> {
    "use server";
    if (!query) {
      const notes = await getAllNotesBySession();
      return notes;
    }
    const notes = await getAllNotesBySessionQuery(query);
    return notes;
  }

  return <NotesSection onGetNotes={handleGetAllNotes} session={session.user} />;
}
