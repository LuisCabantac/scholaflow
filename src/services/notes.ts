import { and, desc, eq, ilike } from "drizzle-orm";
import { validate as validateUUID } from "uuid";

import { db } from "@/db";
import { note } from "@/db/schema";
import type { Note } from "@/lib/schema";

export async function getAllNotesByUserId(
  userId: string,
): Promise<Note[] | null> {
  const data = await db
    .select()
    .from(note)
    .where(eq(note.userId, userId))
    .orderBy(desc(note.createdAt));

  return !data?.length ? null : data;
}

export async function getNoteByNoteIdAndUserId(
  noteId: string,
  userId: string,
): Promise<Note | null> {
  if (!noteId || !validateUUID(noteId)) return null;

  const [data] = await db
    .select()
    .from(note)
    .where(and(eq(note.userId, userId), eq(note.id, noteId)));

  return data || null;
}

export async function getAllNotesByUserIdQuery(
  userId: string,
  query: string,
): Promise<Note[] | null> {
  const data = await db
    .select()
    .from(note)
    .where(and(eq(note.userId, userId), ilike(note.title, `%${query}%`)))
    .orderBy(desc(note.createdAt));

  return !data?.length ? null : data;
}

export async function createNote(
  data: Omit<Note, "id" | "createdAt">,
): Promise<Note | null> {
  const [result] = await db
    .insert(note)
    .values(data as any)
    .returning();

  return result || null;
}

export async function updateNote(
  noteId: string,
  data: Partial<Note>,
): Promise<Note | null> {
  if (!noteId || !validateUUID(noteId)) return null;

  const [result] = await db
    .update(note)
    .set(data)
    .where(eq(note.id, noteId))
    .returning();

  return result || null;
}

export async function deleteNote(noteId: string): Promise<Note | null> {
  if (!noteId || !validateUUID(noteId)) return null;

  const [result] = await db.delete(note).where(eq(note.id, noteId)).returning();

  return result || null;
}
