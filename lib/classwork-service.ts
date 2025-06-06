import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { Classwork } from "@/lib/schema";
import { classwork } from "@/drizzle/schema";
import { getClassByClassId } from "@/lib/classroom-service";
import { getClassStreamByStreamId } from "@/lib/stream-service";

export async function getAllClassworksByClassId(
  classId: string,
): Promise<Classwork[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db
    .select()
    .from(classwork)
    .where(eq(classwork.classId, classId));

  return !data?.length ? null : data;
}

export async function getAllClassworksByStreamId(
  streamId: string,
): Promise<Classwork[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db
    .select()
    .from(classwork)
    .where(eq(classwork.streamId, streamId));

  return !data?.length ? null : data;
}

export async function getAllClassworksByUserId(
  userId: string,
): Promise<Classwork[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const classroom = await getClassByClassId(classId);
  if (!classroom) return null;

  const data = await db
    .select()
    .from(classwork)
    .where(and(eq(classwork.userId, userId), eq(classwork.classId, classId)));

  return !data?.length ? null : data;
}

export async function getClassworkByClassAndUserId(
  userId: string,
  classId: string,
  streamId: string,
): Promise<Classwork | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const classroom = await getClassByClassId(classId);
  if (!classroom) return null;

  const stream = await getClassStreamByStreamId(streamId);
  if (!stream) return null;

  if (!(stream.announceToAll || stream.announceTo.includes(userId)))
    return null;

  const [data] = await db
    .select()
    .from(classwork)
    .where(and(eq(classwork.userId, userId), eq(classwork.streamId, streamId)));

  return data || null;
}

export async function getAllAssignedClassworksByStreamAndClassroomId(
  classId: string,
  streamId: string,
): Promise<Classwork[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const classroom = await getClassByClassId(classId);
  if (!classroom) return null;

  const stream = await getClassStreamByStreamId(streamId);
  if (!stream) return null;

  if (classroom.teacherId !== session.user.id) return null;

  const data = await db
    .select()
    .from(classwork)
    .where(
      and(eq(classwork.classId, classId), eq(classwork.streamId, streamId)),
    );

  return !data?.length ? null : data;
}
