import { eq } from "drizzle-orm";
import { validate as validateUUID } from "uuid";

import { db } from "@/db";
import { chat } from "@/db/schema";
import type { Chat } from "@/lib/schema";

export async function getAllMessagesByClassId(
  classId: string,
): Promise<Chat[] | null> {
  if (!classId || !validateUUID(classId)) return null;

  const data = await db.select().from(chat).where(eq(chat.classId, classId));
  return !data?.length ? null : data;
}

export async function getAllMessagesByUserId(
  userId: string,
): Promise<Chat[] | null> {
  const data = await db.select().from(chat).where(eq(chat.userId, userId));
  return !data?.length ? null : data;
}

export async function deleteAllMessagesByUserId(userId: string): Promise<void> {
  await db.delete(chat).where(eq(chat.userId, userId));
}

export async function deleteAllMessagesByClassIdRecord(
  classId: string,
): Promise<Chat[]> {
  if (!classId || !validateUUID(classId)) return [];

  const data = await db
    .delete(chat)
    .where(eq(chat.classId, classId))
    .returning();

  return data || [];
}

export async function addMessageToChatRecord(
  data: Omit<Chat, "id" | "createdAt">,
): Promise<Chat | null> {
  const [result] = await db
    .insert(chat)
    .values(data as any)
    .returning();

  return result || null;
}
