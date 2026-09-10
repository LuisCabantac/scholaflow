import { and, desc, eq, ilike, ne } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { Stream } from "@/lib/schema";
import { stream } from "@/drizzle/schema";
import {
  getAllEnrolledClassesByUserId,
  getClassByClassId,
} from "@/lib/classroom-service";
import { getClassTopicByTopicId } from "./class-topic-service";

export async function getAllClassStreamsByClassId(
  classId: string,
): Promise<Stream[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const [data] = await db.select().from(stream).where(eq(stream.id, streamId));

  return data || null;
}

export async function getAllClassesStreamByUserId(
  userId: string,
): Promise<Stream[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db.select().from(stream).where(eq(stream.userId, userId));

  return !data?.length ? null : data;
}

export async function getAllClassworkStreamsByClassId(
  classId: string,
): Promise<Stream[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

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
): Promise<Stream[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const enrolledClasses = await getAllEnrolledClassesByUserId(userId);

  const classworks = Array.isArray(enrolledClasses)
    ? await Promise.all(
        enrolledClasses.map(
          async (enrolledClass) =>
            await getAllClassworkStreamsByClassId(enrolledClass.classId),
        ),
      )
    : [];

  return classworks.filter((array): array is Stream[] => array !== null).flat();
}
