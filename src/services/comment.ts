import { and, eq } from "drizzle-orm";
import { validate as validateUUID } from "uuid";

import { db } from "@/db";
import { streamComment, streamPrivateComment } from "@/db/schema";
import type { StreamComment, StreamPrivateComment } from "@/lib/schema";

export async function getAllCommentsByStreamId(
  streamId: string,
): Promise<StreamComment[] | null> {
  if (!streamId || !validateUUID(streamId)) return null;

  const data = await db
    .select()
    .from(streamComment)
    .where(eq(streamComment.streamId, streamId));

  return !data?.length ? null : data;
}

export async function getAllCommentsByUserId(
  userId: string,
): Promise<StreamComment[] | null> {
  const data = await db
    .select()
    .from(streamComment)
    .where(eq(streamComment.userId, userId));

  return !data?.length ? null : data;
}

export async function getStreamCommentByCommentId(
  commentId: string,
): Promise<StreamComment | null> {
  if (!commentId || !validateUUID(commentId)) return null;

  const [data] = await db
    .select()
    .from(streamComment)
    .where(eq(streamComment.id, commentId));

  return data || null;
}

export async function getAllPrivateCommentsByStreamId(
  streamId: string,
): Promise<StreamPrivateComment[] | null> {
  if (!streamId || !validateUUID(streamId)) return null;

  const data = await db
    .select()
    .from(streamPrivateComment)
    .where(eq(streamPrivateComment.streamId, streamId));

  return !data?.length ? null : data;
}

export async function getAllPrivateCommentsByUserId(
  userId: string,
): Promise<StreamPrivateComment[] | null> {
  const data = await db
    .select()
    .from(streamPrivateComment)
    .where(eq(streamPrivateComment.userId, userId));

  return !data?.length ? null : data;
}

export async function getStreamPrivateCommentByCommentId(
  commentId: string,
): Promise<StreamPrivateComment | null> {
  if (!commentId || !validateUUID(commentId)) return null;

  const [data] = await db
    .select()
    .from(streamPrivateComment)
    .where(eq(streamPrivateComment.id, commentId));

  return data || null;
}

export async function deleteAllCommentsByUserId(userId: string): Promise<void> {
  await db.delete(streamComment).where(eq(streamComment.userId, userId));
}

export async function deleteAllPrivateCommentsByUserId(
  userId: string,
): Promise<void> {
  await db
    .delete(streamPrivateComment)
    .where(eq(streamPrivateComment.userId, userId));
}

export async function deleteAllClassStreamCommentsByStreamIdRecord(
  streamId: string,
): Promise<StreamComment[]> {
  if (!streamId || !validateUUID(streamId)) return [];

  const data = await db
    .delete(streamComment)
    .where(eq(streamComment.streamId, streamId))
    .returning();

  return data;
}

export async function deleteAllPrivateStreamCommentsByStreamIdRecord(
  streamId: string,
): Promise<StreamPrivateComment[]> {
  if (!streamId || !validateUUID(streamId)) return [];

  const data = await db
    .delete(streamPrivateComment)
    .where(eq(streamPrivateComment.streamId, streamId))
    .returning();

  return data;
}

export async function createStreamComment(
  data: Omit<StreamComment, "id" | "createdAt" | "updatedAt">,
): Promise<StreamComment | null> {
  const [result] = await db
    .insert(streamComment)
    .values(data as any)
    .returning();

  return result || null;
}

export async function deleteStreamCommentRecord(
  commentId: string,
  streamId: string,
): Promise<StreamComment | null> {
  if (!commentId || !validateUUID(commentId)) return null;
  if (!streamId || !validateUUID(streamId)) return null;

  const [result] = await db
    .delete(streamComment)
    .where(
      and(
        eq(streamComment.id, commentId),
        eq(streamComment.streamId, streamId),
      ),
    )
    .returning();

  return result || null;
}

export async function createPrivateComment(
  data: Omit<StreamPrivateComment, "id" | "createdAt" | "updatedAt">,
): Promise<StreamPrivateComment | null> {
  const [result] = await db
    .insert(streamPrivateComment)
    .values(data as any)
    .returning();

  return result || null;
}

export async function deletePrivateCommentRecord(
  commentId: string,
  streamId: string,
): Promise<StreamPrivateComment | null> {
  if (!commentId || !validateUUID(commentId)) return null;
  if (!streamId || !validateUUID(streamId)) return null;

  const [result] = await db
    .delete(streamPrivateComment)
    .where(
      and(
        eq(streamPrivateComment.id, commentId),
        eq(streamPrivateComment.streamId, streamId),
      ),
    )
    .returning();

  return result || null;
}
