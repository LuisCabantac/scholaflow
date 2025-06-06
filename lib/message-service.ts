import { headers } from "next/headers";

import { db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { Chat } from "@/lib/schema";
import { chat } from "@/drizzle/schema";
import { getUserByUserId } from "@/lib/user-service";
import {
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/classroom-service";

export async function getAllMessagesByClassId(
  classId: string,
): Promise<Chat[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const classroom = await getClassByClassId(classId);

  if (!classroom) return null;

  const enrolledClass = await getEnrolledClassByClassAndSessionId(
    session.user.id,
    classId,
  );

  if (!(classroom.teacherId === session.user.id || enrolledClass)) return null;

  const data = await db.select().from(chat).where(eq(chat.classId, classId));

  return !data?.length ? null : data;
}

export async function getAllMessagesByUserId(
  userId: string,
): Promise<Chat[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const user = await getUserByUserId(userId);

  if (!user) return null;

  const data = await db.select().from(chat).where(eq(chat.userId, userId));

  return !data?.length ? null : data;
}
