import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import {
  chat,
  classroom,
  classwork,
  enrolledClass,
  roleRequest,
  stream,
  streamComment,
  streamPrivateComment,
} from "@/db/schema";

export async function propagateUserProfile(
  userId: string,
  profile: { name: string; image: string; email: string },
): Promise<void> {
  const copy = { userName: profile.name, userImage: profile.image };

  await db.transaction(async (tx) => {
    const taught = await tx
      .select({ id: classroom.id })
      .from(classroom)
      .where(eq(classroom.teacherId, userId));
    const classIds = taught.map((entry) => entry.id);

    await tx
      .update(classroom)
      .set({ teacherName: profile.name })
      .where(eq(classroom.teacherId, userId));
    if (classIds.length) {
      await tx
        .update(enrolledClass)
        .set({ teacherName: profile.name })
        .where(inArray(enrolledClass.classId, classIds));
    }
    await tx
      .update(enrolledClass)
      .set(copy)
      .where(eq(enrolledClass.userId, userId));
    await tx.update(chat).set(copy).where(eq(chat.userId, userId));
    await tx.update(stream).set(copy).where(eq(stream.userId, userId));
    await tx.update(classwork).set(copy).where(eq(classwork.userId, userId));
    await tx
      .update(streamComment)
      .set(copy)
      .where(eq(streamComment.userId, userId));
    await tx
      .update(streamPrivateComment)
      .set(copy)
      .where(eq(streamPrivateComment.userId, userId));
    await tx
      .update(roleRequest)
      .set({ ...copy, userEmail: profile.email })
      .where(eq(roleRequest.userId, userId));
  });
}
