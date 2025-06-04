import { and, desc, eq, ilike } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { Note } from "@/lib/schema";
import { note } from "@/drizzle/schema";

export async function getAllNotesBySession(): Promise<Note[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db
    .select()
    .from(note)
    .where(eq(note.userId, session.user.id))
    .orderBy(desc(note.createdAt));

  return !data?.length ? null : data;
}

export async function getNoteByNoteIdSession(
  noteId: string,
): Promise<Note | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const [data] = await db
    .select()
    .from(note)
    .where(and(eq(note.userId, session.user.id), eq(note.id, noteId)));

  return data || null;
}

export async function getAllNotesBySessionQuery(
  query: string,
): Promise<Note[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db
    .select()
    .from(note)
    .where(
      and(eq(note.userId, session.user.id), ilike(note.title, `%${query}%`)),
    )
    .orderBy(desc(note.createdAt));

  return !data?.length ? null : data;
}
