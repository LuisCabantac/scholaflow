import { validate as validateUUID } from "uuid";
import { and, desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { classroom, enrolledClass } from "@/db/schema";
import type { Classroom, EnrolledClass } from "@/lib/schema";

export async function getAllClassesByTeacherId(
  id: string,
): Promise<Classroom[] | null> {
  const data = await db
    .select()
    .from(classroom)
    .where(eq(classroom.teacherId, id))
    .orderBy(desc(classroom.createdAt));

  return !data?.length ? null : data;
}

export async function getClassNameByClassId(
  id: string,
): Promise<{ className: string } | null> {
  if (!id || !validateUUID(id)) return null;

  const [data] = await db
    .select({ className: classroom.name })
    .from(classroom)
    .where(eq(classroom.id, id));

  return data || null;
}

export async function getClassByClassId(id: string): Promise<Classroom | null> {
  if (!id || !validateUUID(id)) return null;
  const [data] = await db.select().from(classroom).where(eq(classroom.id, id));
  return data || null;
}

export async function getClassByClassCode(
  code: string,
): Promise<Classroom | null> {
  const [data] = await db
    .select()
    .from(classroom)
    .where(eq(classroom.code, code));
  return data || null;
}

export async function getEnrolledClassByClassAndSessionId(
  userId: string,
  classId: string,
): Promise<EnrolledClass | null> {
  if (!classId || !validateUUID(classId)) return null;
  const [data] = await db
    .select()
    .from(enrolledClass)
    .where(
      and(eq(enrolledClass.classId, classId), eq(enrolledClass.userId, userId)),
    );
  return data || null;
}

export async function getEnrolledClassByEnrolledClassId(
  enrolledClassId: string,
): Promise<EnrolledClass | null> {
  if (!enrolledClassId || !validateUUID(enrolledClassId)) return null;

  const [data] = await db
    .select()
    .from(enrolledClass)
    .where(eq(enrolledClass.id, enrolledClassId));
  return data || null;
}

export async function getAllEnrolledClassesByClassAndSessionId(
  classId: string,
): Promise<EnrolledClass[] | null> {
  if (!classId || !validateUUID(classId)) return null;
  const data = await db
    .select()
    .from(enrolledClass)
    .where(eq(enrolledClass.classId, classId));
  return !data?.length ? null : data;
}

export async function getEnrolledClassByClassAndUserId(
  userId: string,
  classId: string,
): Promise<EnrolledClass | null> {
  if (!classId || !validateUUID(classId)) return null;
  const [data] = await db
    .select()
    .from(enrolledClass)
    .where(
      and(eq(enrolledClass.classId, classId), eq(enrolledClass.userId, userId)),
    );
  return data || null;
}

export async function getAllEnrolledClassesByUserId(
  userId: string,
): Promise<EnrolledClass[] | null> {
  const data = await db
    .select()
    .from(enrolledClass)
    .where(eq(enrolledClass.userId, userId))
    .orderBy(desc(enrolledClass.createdAt));
  return !data?.length ? null : data;
}

export async function getAllEnrolledClassesByClassId(
  classId: string,
): Promise<EnrolledClass[] | null> {
  if (!classId || !validateUUID(classId)) return null;
  const data = await db
    .select()
    .from(enrolledClass)
    .where(eq(enrolledClass.classId, classId));
  return !data?.length ? null : data;
}

export async function getEnrolledClassByUserAndClassId(
  userId: string,
  classId: string,
): Promise<EnrolledClass | null> {
  if (!classId || !validateUUID(classId)) return null;
  const [data] = await db
    .select()
    .from(enrolledClass)
    .where(
      and(eq(enrolledClass.classId, classId), eq(enrolledClass.userId, userId)),
    );
  return data || null;
}

export async function deleteEnrolledClassbyClassAndEnrolledClassId(
  enrolledClassId: string,
  classId: string,
): Promise<{ id: string } | null> {
  if (!classId || !validateUUID(classId)) return null;
  if (!enrolledClassId || !validateUUID(enrolledClassId)) return null;

  const [deleted] = await db
    .delete(enrolledClass)
    .where(
      and(
        eq(enrolledClass.id, enrolledClassId),
        eq(enrolledClass.classId, classId),
      ),
    )
    .returning({ id: enrolledClass.id });
  return deleted || null;
}

export async function deleteClass(classId: string): Promise<void> {
  if (!classId || !validateUUID(classId)) return;
  await db.delete(classroom).where(eq(classroom.id, classId));
}

export async function createClassroom(
  data: Omit<Classroom, "id" | "createdAt">,
): Promise<{ id: string } | null> {
  const [result] = await db
    .insert(classroom)
    .values(data)
    .returning({ id: classroom.id });
  return result || null;
}

export async function updateClassroom(
  classroomId: string,
  data: Partial<Classroom>,
): Promise<boolean> {
  const [result] = await db
    .update(classroom)
    .set(data)
    .where(eq(classroom.id, classroomId))
    .returning();
  return !!result;
}

export async function updateEnrolledClass(
  enrolledClassId: string,
  data: Partial<EnrolledClass>,
): Promise<void> {
  await db
    .update(enrolledClass)
    .set(data)
    .where(eq(enrolledClass.id, enrolledClassId));
}

export async function createEnrolledClass(
  data: Omit<EnrolledClass, "id" | "createdAt">,
): Promise<EnrolledClass | null> {
  const [result] = await db.insert(enrolledClass).values(data).returning();
  return result || null;
}

export async function deleteMultipleEnrolledClassRecord(
  enrolledIds: string[],
): Promise<void> {
  const chunks = [];
  for (let i = 0; i < enrolledIds.length; i += 50) {
    chunks.push(enrolledIds.slice(i, i + 50));
  }
  for (const chunk of chunks) {
    if (chunk.length > 0) {
      await db.delete(enrolledClass).where(inArray(enrolledClass.id, chunk));
    }
  }
}
