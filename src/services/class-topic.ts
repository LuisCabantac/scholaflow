import { desc, eq } from "drizzle-orm";
import { validate as validateUUID } from "uuid";

import { db } from "@/db";
import { classTopic } from "@/db/schema";
import type { ClassTopic } from "@/lib/schema";

export async function getClassTopicByTopicId(
  topicId: string,
): Promise<ClassTopic | null> {
  if (!topicId || !validateUUID(topicId)) return null;

  const [data] = await db
    .select()
    .from(classTopic)
    .where(eq(classTopic.id, topicId));

  return data || null;
}

export async function getAllClassTopicsByClassId(
  classId: string,
): Promise<ClassTopic[] | null> {
  if (!classId || !validateUUID(classId)) return null;

  const data = await db
    .select()
    .from(classTopic)
    .where(eq(classTopic.classId, classId))
    .orderBy(desc(classTopic.createdAt));

  return !data?.length ? null : data;
}

export async function createClassTopicRecord(
  data: Omit<ClassTopic, "id" | "createdAt">,
): Promise<ClassTopic | null> {
  const [result] = await db
    .insert(classTopic)
    .values(data as any)
    .returning();

  return result || null;
}

export async function updateClassTopicRecord(
  topicId: string,
  data: Partial<ClassTopic>,
): Promise<ClassTopic | null> {
  if (!topicId || !validateUUID(topicId)) return null;

  const [result] = await db
    .update(classTopic)
    .set(data)
    .where(eq(classTopic.id, topicId))
    .returning();

  return result || null;
}

export async function deleteClassTopicRecord(
  topicId: string,
): Promise<ClassTopic | null> {
  if (!topicId || !validateUUID(topicId)) return null;

  const [result] = await db
    .delete(classTopic)
    .where(eq(classTopic.id, topicId))
    .returning();

  return result || null;
}
