import { and, eq } from "drizzle-orm";
import { validate as validateUUID } from "uuid";

import { db } from "@/db";
import { classwork } from "@/db/schema";
import type { Classwork } from "@/lib/schema";

export async function getAllClassworksByClassId(
  classId: string,
): Promise<Classwork[] | null> {
  if (!classId || !validateUUID(classId)) return null;

  const data = await db
    .select()
    .from(classwork)
    .where(eq(classwork.classId, classId));

  return !data?.length ? null : data;
}

export async function getAllClassworksByStreamId(
  streamId: string,
): Promise<Classwork[] | null> {
  if (!streamId || !validateUUID(streamId)) return null;

  const data = await db
    .select()
    .from(classwork)
    .where(eq(classwork.streamId, streamId));

  return !data?.length ? null : data;
}

export async function getAllClassworksByUserId(
  userId: string,
): Promise<Classwork[] | null> {
  const data = await db
    .select()
    .from(classwork)
    .where(eq(classwork.userId, userId));

  return !data?.length ? null : data;
}

export async function getAllClassworksByClassAndUserId(
  userId: string,
  classId: string,
): Promise<Classwork[] | null> {
  if (!classId || !validateUUID(classId)) return null;

  const data = await db
    .select()
    .from(classwork)
    .where(and(eq(classwork.userId, userId), eq(classwork.classId, classId)));

  return !data?.length ? null : data;
}

export async function getClassworkByStreamAndUserId(
  streamId: string,
  userId: string,
): Promise<Classwork | null> {
  if (!streamId || !validateUUID(streamId)) return null;

  const [data] = await db
    .select()
    .from(classwork)
    .where(and(eq(classwork.userId, userId), eq(classwork.streamId, streamId)));

  return data || null;
}

export async function getClassworkByClassAndUserId(
  userId: string,
  classId: string,
  streamId: string,
): Promise<Classwork | null> {
  if (!classId || !validateUUID(classId)) return null;
  if (!streamId || !validateUUID(streamId)) return null;

  const [data] = await db
    .select()
    .from(classwork)
    .where(
      and(
        eq(classwork.userId, userId),
        eq(classwork.classId, classId),
        eq(classwork.streamId, streamId),
      ),
    );

  return data || null;
}

export async function getAllAssignedClassworksByStreamAndClassroomId(
  classId: string,
  streamId: string,
): Promise<Classwork[] | null> {
  if (!classId || !validateUUID(classId)) return null;
  if (!streamId || !validateUUID(streamId)) return null;

  const data = await db
    .select()
    .from(classwork)
    .where(
      and(eq(classwork.classId, classId), eq(classwork.streamId, streamId)),
    );

  return !data?.length ? null : data;
}

export async function createClasswork(
  data: Omit<Classwork, "id" | "createdAt">,
): Promise<Classwork | null> {
  const [result] = await db
    .insert(classwork)
    .values(data as any)
    .returning();

  return result || null;
}

export async function updateClassworkRecord(
  classworkId: string,
  data: Partial<Classwork>,
): Promise<Classwork | null> {
  if (!classworkId || !validateUUID(classworkId)) return null;

  const [result] = await db
    .update(classwork)
    .set(data)
    .where(eq(classwork.id, classworkId))
    .returning();

  return result || null;
}

export async function deleteAllClassworksByClassAndUserIdRecord(
  classId: string,
  userId: string,
): Promise<Classwork[]> {
  if (!classId || !validateUUID(classId)) return [];

  const data = await db
    .delete(classwork)
    .where(and(eq(classwork.userId, userId), eq(classwork.classId, classId)))
    .returning();

  return data;
}

export async function deleteAllClassworksByStreamIdRecord(
  streamId: string,
): Promise<Classwork[]> {
  if (!streamId || !validateUUID(streamId)) return [];

  const data = await db
    .delete(classwork)
    .where(eq(classwork.streamId, streamId))
    .returning();

  return data;
}
