import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { ClassTopic } from "@/lib/schema";
import { classTopic } from "@/drizzle/schema";

export async function getClassTopicByTopicId(
  topicId: string,
): Promise<ClassTopic | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const [data] = await db
    .select()
    .from(classTopic)
    .where(eq(classTopic.id, topicId));

  return data || null;
}

export async function getAllClassTopicsByClassId(
  classId: string,
): Promise<ClassTopic[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db
    .select()
    .from(classTopic)
    .where(eq(classTopic.classId, classId))
    .orderBy(desc(classTopic.createdAt));

  return !data.length ? null : data;
}
