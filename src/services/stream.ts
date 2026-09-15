import { validate as validateUUID } from "uuid";
import { and, desc, eq, ilike, ne } from "drizzle-orm";

import { db } from "@/db";
import { stream } from "@/db/schema";
import type { Stream } from "@/lib/schema";
import { getClassTopicByTopicId } from "@/services/class-topic";
import {
  getClassByClassId,
  getAllEnrolledClassesByUserId,
} from "@/services/classroom";

export async function getAllClassStreamsByClassId(
  classId: string,
): Promise<Stream[] | null> {
  if (!classId || !validateUUID(classId)) return null;

  const data = await db
    .select()
    .from(stream)
    .where(eq(stream.classId, classId))
    .orderBy(desc(stream.createdAt));

  return !data?.length ? null : data;
}

export async function getClassStreamByStreamId(
  streamId: string,
): Promise<Stream | null> {
  if (!streamId || !validateUUID(streamId)) return null;

  const [data] = await db.select().from(stream).where(eq(stream.id, streamId));
  return data || null;
}

export async function getAllClassesStreamByUserId(
  userId: string,
): Promise<Stream[] | null> {
  const data = await db.select().from(stream).where(eq(stream.userId, userId));
  return !data?.length ? null : data;
}

export async function getAllClassworkStreamsByClassId(
  classId: string,
): Promise<Stream[] | null> {
  const classroom = await getClassByClassId(classId);

  if (!classroom) return null;

  const data = await db
    .select()
    .from(stream)
    .where(and(eq(stream.classId, classId), ne(stream.type, "stream")))
    .orderBy(desc(stream.createdAt));

  return !data?.length ? null : data;
}

export async function getAllClassworkStreamsByTopicId(
  topicId: string,
): Promise<Stream[] | null> {
  const topic = await getClassTopicByTopicId(topicId);
  if (!topic) return null;

  const data = await db
    .select()
    .from(stream)
    .where(and(eq(stream.topicId, topicId), ne(stream.type, "stream")))
    .orderBy(desc(stream.createdAt));

  return !data?.length ? null : data;
}

export async function getClassworksByClassIdQuery(
  classId: string,
  query: string,
): Promise<Stream[] | null> {
  const classroom = await getClassByClassId(classId);

  if (!classroom) return null;

  const data = await db
    .select()
    .from(stream)
    .where(
      and(
        eq(stream.classId, classId),
        ne(stream.type, "stream"),
        ilike(stream.title, `%${query}%`),
      ),
    )
    .orderBy(desc(stream.createdAt));

  return !data?.length ? null : data;
}

export async function getAllEnrolledClassesClassworks(
  userId: string,
): Promise<Stream[]> {
  const enrolledClasses = await getAllEnrolledClassesByUserId(userId);

  const classworks = Array.isArray(enrolledClasses)
    ? await Promise.all(
        enrolledClasses.map(
          async (enrolledClass) =>
            await getAllClassworkStreamsByClassId(enrolledClass.classId),
        ),
      )
    : [];

  return classworks.flatMap((arr) => arr ?? []);
}

export async function deleteClassStreamPost(streamId: string): Promise<void> {
  if (!streamId || !validateUUID(streamId)) return;
  await db.delete(stream).where(eq(stream.id, streamId));
}

export async function createStreamPost(
  data: Omit<Stream, "id" | "isPinned" | "createdAt" | "updatedAt">,
): Promise<Stream | null> {
  const [result] = await db
    .insert(stream)
    .values(data as any)
    .returning();
  return result || null;
}

export async function updateStreamPost(
  streamId: string,
  data: Partial<Stream>,
): Promise<Stream | null> {
  if (!streamId || !validateUUID(streamId)) return null;

  const [result] = await db
    .update(stream)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(stream.id, streamId))
    .returning();
  return result || null;
}

export async function updateClassStreamPostTopic(
  type: "edit" | "delete",
  streamData: Stream,
  topicName?: string,
): Promise<void> {
  if (type === "edit") {
    await db
      .update(stream)
      .set({ topicName: topicName ?? null, updatedAt: new Date() })
      .where(eq(stream.id, streamData.id));
  } else if (type === "delete") {
    await db
      .update(stream)
      .set({ topicName: null, topicId: null, updatedAt: new Date() })
      .where(eq(stream.id, streamData.id));
  }
}
