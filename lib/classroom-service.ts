import { headers } from "next/headers";
import { validate as validateUUID } from "uuid";
import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { Classroom, EnrolledClass } from "@/lib/schema";
import { classroom, enrolledClass } from "@/drizzle/schema";

export async function getAllClassesByTeacherId(
  id: string,
): Promise<Classroom[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const data = await db
    .select()
    .from(classroom)
    .where(eq(classroom.teacherId, id))
    .orderBy(asc(classroom.createdAt));

  return !data?.length ? null : data;
}

export async function getClassNameByClassId(id: string): Promise<{
  className: string;
} | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (!id || !validateUUID(id)) {
    return null;
  }

  const [data] = await db
    .select({ className: classroom.id })
    .from(classroom)
    .where(eq(classroom.id, id));

  return data || null;
}

export async function getClassByClassId(id: string): Promise<Classroom | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (!id || !validateUUID(id)) {
    return null;
  }

  const [data] = await db.select().from(classroom).where(eq(classroom.id, id));

  return data || null;
}

export async function getClassByClassCode(
  code: string,
): Promise<Classroom | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (!classId || !validateUUID(classId)) {
    return null;
  }

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (!enrolledClassId || !validateUUID(enrolledClassId)) {
    return null;
  }

  const [data] = await db
    .select()
    .from(enrolledClass)
    .where(eq(enrolledClass.id, enrolledClassId));

  return data || null;
}

export async function getAllEnrolledClassesByClassAndSessionId(
  classId: string,
): Promise<EnrolledClass[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (!classId || !validateUUID(classId)) {
    return null;
  }

  const data = await db
    .select()
    .from(enrolledClass)
    .where(eq(enrolledClass.classId, classId));

  return !data?.length ? null : data;
}

// export async function getAllEnrolledClassesByClassAndCurrentSessionId(
//   classId: string,
// ): Promise<EnrolledClass[] | null> {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session) return null;

//   const data = await db
//     .select()
//     .from(enrolledClass)
//     .where(
//       and(
//         eq(enrolledClass.classId, classId),
//         eq(enrolledClass.userId, session.user.id),
//       ),
//     );

//   return !data?.length ? null : data;
// }

export async function getEnrolledClassByClassAndUserId(
  userId: string,
  classId: string,
): Promise<EnrolledClass | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (!classId || !validateUUID(classId)) {
    return null;
  }

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (!classId || !validateUUID(classId)) {
    return null;
  }

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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (!classId || !validateUUID(classId)) {
    return null;
  }

  const [data] = await db
    .select()
    .from(enrolledClass)
    .where(
      and(eq(enrolledClass.classId, classId), eq(enrolledClass.userId, userId)),
    );

  return data || null;
}
