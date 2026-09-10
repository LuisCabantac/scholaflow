import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { StreamComment, StreamPrivateComment } from "@/lib/schema";
import { streamComment, streamPrivateComment } from "@/drizzle/schema";

export async function getAllCommentsByStreamId(
  streamId: string,
): Promise<StreamComment[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db
    .select()
    .from(streamComment)
    .where(eq(streamComment.streamId, streamId));

  return !data?.length ? null : data;
}

export async function getAllCommentsByUserId(
  userId: string,
): Promise<StreamComment[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db
    .select()
    .from(streamComment)
    .where(eq(streamComment.userId, userId));

  return !data?.length ? null : data;
}

export async function getStreamCommentByCommentId(
  commentId: string,
): Promise<StreamComment | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const [data] = await db
    .select()
    .from(streamComment)
    .where(eq(streamComment.id, commentId));

  return data || null;
}

export async function getAllPrivateCommentsByStreamId(
  streamId: string,
): Promise<StreamPrivateComment[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db
    .select()
    .from(streamPrivateComment)
    .where(eq(streamPrivateComment.streamId, streamId));

  return !data?.length ? null : data;
}

export async function getAllPrivateCommentsByUserId(
  userId: string,
): Promise<StreamPrivateComment[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db
    .select()
    .from(streamPrivateComment)
    .where(eq(streamPrivateComment.userId, userId));

  return !data?.length ? null : data;
}

export async function getStreamPrivateCommentByCommentId(
  commentId: string,
): Promise<StreamPrivateComment | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const [data] = await db
    .select()
    .from(streamPrivateComment)
    .where(eq(streamPrivateComment.id, commentId));

  return data || null;
}
