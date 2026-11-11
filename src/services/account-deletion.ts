import { eq, inArray, or } from "drizzle-orm";

import { db } from "@/db";
import {
  chat,
  classroom,
  classTopic,
  classwork,
  enrolledClass,
  note,
  notification,
  roleRequest,
  stream,
  streamComment,
  streamPrivateComment,
  user,
} from "@/db/schema";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function deleteStreamsWithDependents(tx: Tx, streamIds: string[]) {
  if (!streamIds.length) return;

  await tx.delete(classwork).where(inArray(classwork.streamId, streamIds));
  await tx
    .delete(streamComment)
    .where(inArray(streamComment.streamId, streamIds));
  await tx
    .delete(streamPrivateComment)
    .where(inArray(streamPrivateComment.streamId, streamIds));
  await tx.delete(stream).where(inArray(stream.id, streamIds));
}

async function deleteClassesWithDependents(tx: Tx, classIds: string[]) {
  if (!classIds.length) return;

  const classStreams = await tx
    .select({ id: stream.id })
    .from(stream)
    .where(inArray(stream.classId, classIds));

  await deleteStreamsWithDependents(
    tx,
    classStreams.map((entry) => entry.id),
  );
  await tx.delete(classwork).where(inArray(classwork.classId, classIds));
  await tx
    .delete(streamComment)
    .where(inArray(streamComment.classId, classIds));
  await tx
    .delete(streamPrivateComment)
    .where(inArray(streamPrivateComment.classId, classIds));
  await tx.delete(classTopic).where(inArray(classTopic.classId, classIds));
  await tx.delete(chat).where(inArray(chat.classId, classIds));
  await tx
    .delete(enrolledClass)
    .where(inArray(enrolledClass.classId, classIds));
  await tx.delete(classroom).where(inArray(classroom.id, classIds));
}

export async function deleteUserCascade(userId: string): Promise<boolean> {
  return await db.transaction(async (tx) => {
    const taught = await tx
      .select({ id: classroom.id })
      .from(classroom)
      .where(eq(classroom.teacherId, userId));
    await deleteClassesWithDependents(
      tx,
      taught.map((entry) => entry.id),
    );

    const authored = await tx
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.userId, userId));
    await deleteStreamsWithDependents(
      tx,
      authored.map((entry) => entry.id),
    );

    await tx.delete(classwork).where(eq(classwork.userId, userId));
    await tx
      .delete(streamPrivateComment)
      .where(
        or(
          eq(streamPrivateComment.userId, userId),
          eq(streamPrivateComment.toUserId, userId),
        ),
      );
    await tx.delete(streamComment).where(eq(streamComment.userId, userId));
    await tx.delete(chat).where(eq(chat.userId, userId));
    await tx.delete(enrolledClass).where(eq(enrolledClass.userId, userId));
    await tx.delete(note).where(eq(note.userId, userId));
    await tx.delete(notification).where(eq(notification.userId, userId));
    await tx.delete(roleRequest).where(eq(roleRequest.userId, userId));

    const [deleted] = await tx
      .delete(user)
      .where(eq(user.id, userId))
      .returning({ id: user.id });

    return !!deleted;
  });
}
