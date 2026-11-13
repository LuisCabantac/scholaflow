import type { Outcome } from "@/types/api";
import type { Classroom } from "@/lib/schema";
import type { SessionUser } from "@/types/auth";
import { getUserByEmail } from "@/services/user";
import { canRemoveEnrollment } from "@/server/authorize/classroom";
import { deleteFilesFromBucket } from "@/services/user-management";
import { createClassroomSchema, createEnrolledClassSchema } from "@/lib/schema";
import {
  deleteClassStreamPost,
  getAllClassStreamsByClassId,
} from "@/services/stream";
import {
  deleteClassTopicRecord,
  getAllClassTopicsByClassId,
} from "@/services/class-topic";
import {
  deleteAllMessagesByClassIdRecord,
  getAllMessagesByClassId,
} from "@/services/message";
import {
  deleteAllNotificationsByResourceId,
  sendNotification,
} from "@/services/notification";
import {
  extractClassworkFilePath,
  extractCommentFilePath,
  extractMessagesFilePath,
  extractStreamFilePath,
  generateClassCode,
} from "@/lib/utils";
import {
  deleteAllClassworksByClassAndUserIdRecord,
  deleteAllClassworksByStreamIdRecord,
  getAllClassworksByClassAndUserId,
  getAllClassworksByStreamId,
} from "@/services/classwork";
import {
  deleteAllClassStreamCommentsByStreamIdRecord,
  deleteAllPrivateStreamCommentsByStreamIdRecord,
  getAllCommentsByStreamId,
  getAllPrivateCommentsByStreamId,
} from "@/services/comment";
import {
  createClassroom,
  createEnrolledClass,
  deleteClass,
  deleteEnrolledClassbyClassAndEnrolledClassId,
  deleteMultipleEnrolledClassRecord,
  getAllEnrolledClassesByClassId,
  getClassByClassCode,
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
  getEnrolledClassByEnrolledClassId,
  getEnrolledClassByUserAndClassId,
  updateClassroom,
  updateEnrolledClass,
} from "@/services/classroom";

export type Actor = Pick<SessionUser, "id" | "name" | "image" | "role">;

export type NewClassInput = {
  name: string;
  subject: string | null;
  section: string;
  room: string | null;
  color: string;
};

export type ClassUpdateInput = {
  name: string;
  subject: string | null;
  section: string | null;
  description: string | null;
  color: string;
  allowUsersToComment: boolean;
  allowUsersToPost: boolean;
  regenerateCode: boolean;
};

const notFound: Outcome<never> = {
  ok: false,
  code: "not_found",
  message: "This class doesn't exist.",
};

function failure(
  code: "forbidden" | "conflict" | "validation_failed" | "not_found",
  message: string,
): Outcome<never> {
  return { ok: false, code, message };
}

const done: Outcome<void> = { ok: true, value: undefined };

export function newClassRecord(
  user: Actor,
  input: NewClassInput,
): Omit<Classroom, "id" | "createdAt"> {
  return {
    name: input.name,
    subject: input.subject,
    section: input.section,
    room: input.room,
    cardBackground: input.color,
    illustrationIndex: Math.floor(Math.random() * 5),
    code: generateClassCode(),
    teacherId: user.id,
    teacherName: user.name,
    teacherImage: user.image as string,
    description: null,
    allowUsersToComment: false,
    allowUsersToPost: false,
  };
}

export function classChanges(
  current: Classroom,
  input: ClassUpdateInput,
  user: Actor,
) {
  const changed =
    input.regenerateCode ||
    current.name !== input.name ||
    current.subject !== input.subject ||
    current.teacherName !== user.name ||
    current.teacherImage !== user.image ||
    current.description !== input.description ||
    current.section !== input.section ||
    current.cardBackground !== input.color ||
    current.allowUsersToComment !== input.allowUsersToComment ||
    current.allowUsersToPost !== input.allowUsersToPost;

  if (!changed) return null;

  return {
    classroom: {
      name: input.name,
      subject: input.subject,
      section: input.section ?? "",
      description: input.description ?? "",
      teacherName: user.name,
      teacherImage: user.image as string,
      allowUsersToComment: input.allowUsersToComment,
      allowUsersToPost: input.allowUsersToPost,
      cardBackground: input.color,
      code: input.regenerateCode ? generateClassCode() : current.code,
    },
    enrolled: {
      teacherName: user.name,
      teacherImage: user.image ?? "",
      name: input.name,
      subject: input.subject,
      section: input.section ?? "",
      cardBackground: input.color,
    },
  };
}

function enrollmentRecord(
  classroom: Classroom,
  member: { id: string; name: string; image?: string | null },
) {
  return {
    classId: classroom.id,
    userId: member.id,
    userName: member.name,
    userImage: member.image as string,
    name: classroom.name,
    subject: classroom.subject,
    section: classroom.section,
    teacherName: classroom.teacherName,
    teacherImage: classroom.teacherImage,
    cardBackground: classroom.cardBackground,
    illustrationIndex: classroom.illustrationIndex,
  };
}

async function removeMemberClassworks(
  classId: string,
  userId: string,
): Promise<void> {
  const classworks = await getAllClassworksByClassAndUserId(userId, classId);
  if (!classworks?.length) return;

  const attachments = classworks.flatMap((cw) => cw.attachments || []);
  if (attachments.length) {
    await deleteFilesFromBucket(
      "classworks",
      attachments.map((file) => extractClassworkFilePath(file as string)),
    );
  }
  for (const cw of classworks) {
    await deleteAllNotificationsByResourceId(cw.id);
  }
  await deleteAllClassworksByClassAndUserIdRecord(classId, userId);
}

export async function createClassFlow(
  user: Actor,
  input: NewClassInput,
): Promise<Outcome<{ id: string }>> {
  const result = createClassroomSchema.safeParse(newClassRecord(user, input));
  if (result.error) {
    return failure("validation_failed", "Invalid class information provided.");
  }

  const data = await createClassroom({
    ...result.data,
    description: null,
    allowUsersToComment: false,
    allowUsersToPost: false,
  });
  if (!data) return failure("conflict", "Failed to create class");

  return { ok: true, value: { id: data.id } };
}

export async function updateClassFlow(
  user: Actor,
  classId: string,
  input: ClassUpdateInput,
): Promise<Outcome<{ changed: boolean }>> {
  const current = await getClassByClassId(classId);
  if (!current) return notFound;
  if (current.teacherId !== user.id) {
    return failure("forbidden", "Only the creator can edit this.");
  }

  const changes = classChanges(current, input, user);
  if (!changes) return { ok: true, value: { changed: false } };

  const enrolledClasses = await getAllEnrolledClassesByClassId(classId);
  for (const enrolledClass of enrolledClasses ?? []) {
    await updateEnrolledClass(enrolledClass.id, changes.enrolled);
  }
  await updateClassroom(classId, changes.classroom);

  return { ok: true, value: { changed: true } };
}

export async function joinClassFlow(
  user: Actor,
  code: string,
): Promise<Outcome<{ classId: string }>> {
  if (user.role === "admin") {
    return failure("conflict", "Only teachers and students can join classes.");
  }

  const classroom = await getClassByClassCode(code.trim());
  if (!classroom) return failure("not_found", "Class not found");

  const existing = await getEnrolledClassByClassAndSessionId(
    user.id,
    classroom.id,
  );
  if (classroom.teacherId === user.id || existing) {
    return failure("conflict", "You're already in this class.");
  }

  const result = createEnrolledClassSchema.safeParse(
    enrollmentRecord(classroom, user),
  );
  if (result.error) {
    return failure("validation_failed", "Invalid enrollment data.");
  }

  const data = await createEnrolledClass(result.data);
  if (!data) {
    return failure("conflict", "Failed to join the class. Please try again.");
  }

  await sendNotification(
    "join",
    classroom.teacherId,
    data.id,
    data.name,
    `/classroom/class/${data.classId}`,
    user.name,
    user.image as string,
  );

  return { ok: true, value: { classId: classroom.id } };
}

export async function removeMemberFlow(
  user: Actor,
  classId: string,
  enrollmentId: string,
): Promise<Outcome<void>> {
  const enrollment = await getEnrolledClassByEnrolledClassId(enrollmentId);
  if (!enrollment || enrollment.classId !== classId) {
    return failure("not_found", "You are not a member of this class.");
  }

  const classroom = await getClassByClassId(classId);
  if (!classroom) return notFound;

  const allowed = canRemoveEnrollment(classroom, enrollment, user.id);
  if (!allowed.ok) return allowed;

  await removeMemberClassworks(enrollment.classId, enrollment.userId);

  const data = await deleteEnrolledClassbyClassAndEnrolledClassId(
    enrollmentId,
    classId,
  );
  if (!data) return failure("conflict", "Failed to remove member.");

  await deleteAllNotificationsByResourceId(data.id);
  return done;
}

async function deleteStreamContent(streamId: string): Promise<void> {
  const comments = await getAllCommentsByStreamId(streamId);
  if (comments?.length) {
    const files = comments.map((c) => c.attachment).filter(Boolean) as string[];
    if (files.length) {
      await deleteFilesFromBucket(
        "comments",
        files.map(extractCommentFilePath),
      );
    }
    for (const c of comments) await deleteAllNotificationsByResourceId(c.id);
    await deleteAllClassStreamCommentsByStreamIdRecord(streamId);
  }

  const privateComments = await getAllPrivateCommentsByStreamId(streamId);
  if (privateComments?.length) {
    const files = privateComments
      .map((c) => c.attachment)
      .filter(Boolean) as string[];
    if (files.length) {
      await deleteFilesFromBucket(
        "comments",
        files.map(extractCommentFilePath),
      );
    }
    for (const c of privateComments) {
      await deleteAllNotificationsByResourceId(c.id);
    }
    await deleteAllPrivateStreamCommentsByStreamIdRecord(streamId);
  }

  const classworks = await getAllClassworksByStreamId(streamId);
  if (classworks?.length) {
    const files = classworks.flatMap((cw) => cw.attachments || []);
    if (files.length) {
      await deleteFilesFromBucket(
        "classworks",
        files.map((file) => extractClassworkFilePath(file as string)),
      );
    }
    for (const cw of classworks)
      await deleteAllNotificationsByResourceId(cw.id);
    await deleteAllClassworksByStreamIdRecord(streamId);
  }
}

export async function deleteClassFlow(
  user: Actor,
  classId: string,
): Promise<Outcome<void>> {
  const classroom = await getClassByClassId(classId);
  if (!classroom) return notFound;
  if (classroom.teacherId !== user.id) {
    return failure("forbidden", "Only the creator can delete this class.");
  }

  const enrolled = await getAllEnrolledClassesByClassId(classId);
  if (enrolled?.length) {
    const ids = enrolled.map((row) => row.id);
    for (const id of ids) await deleteAllNotificationsByResourceId(id);
    await deleteMultipleEnrolledClassRecord(ids);
  }

  const messages = await getAllMessagesByClassId(classId);
  if (messages?.length) {
    const files = messages.flatMap((chat) => chat.attachments || []);
    if (files.length) {
      await deleteFilesFromBucket(
        "messages",
        files.map((file) => extractMessagesFilePath(file as string)),
      );
    }
    await deleteAllMessagesByClassIdRecord(classId);
  }

  const streams = await getAllClassStreamsByClassId(classId);
  for (const stream of streams ?? []) {
    await deleteStreamContent(stream.id);
    if (stream.attachments?.length) {
      await deleteFilesFromBucket(
        "streams",
        stream.attachments.map((file) => extractStreamFilePath(file as string)),
      );
    }
    await deleteAllNotificationsByResourceId(stream.id);
    await deleteClassStreamPost(stream.id);
  }

  const topics = await getAllClassTopicsByClassId(classId);
  for (const topic of topics ?? []) await deleteClassTopicRecord(topic.id);

  await deleteClass(classId);
  return done;
}

export async function leaveClassFlow(
  user: Actor,
  classId: string,
): Promise<Outcome<void>> {
  const classroom = await getClassByClassId(classId);
  if (!classroom) return notFound;

  const enrollment = await getEnrolledClassByClassAndSessionId(
    user.id,
    classId,
  );
  if (!enrollment) {
    return failure("forbidden", "You are not enrolled in this class.");
  }

  await removeMemberClassworks(classId, user.id);

  const data = await deleteEnrolledClassbyClassAndEnrolledClassId(
    enrollment.id,
    classId,
  );
  if (data) await deleteAllNotificationsByResourceId(data.id);

  return done;
}

export async function addMemberFlow(
  user: Actor,
  classId: string,
  email: string,
): Promise<Outcome<{ enrollmentId: string }>> {
  if (user.role === "admin") {
    return failure("conflict", "Only teachers can add users to this class.");
  }

  const classroom = await getClassByClassId(classId);
  if (!classroom) return notFound;
  if (classroom.teacherId !== user.id) {
    return failure(
      "forbidden",
      "Only the creator of this class can add users.",
    );
  }

  const member = await getUserByEmail(email);
  if (!member) {
    return failure("not_found", "No account found for this email address.");
  }
  if (classroom.teacherId === member.id) {
    return failure("conflict", "This user is already a member of this class.");
  }
  if (member.role === "admin") {
    return failure(
      "conflict",
      "This class can only include students and teachers.",
    );
  }

  const existing = await getEnrolledClassByUserAndClassId(member.id, classId);
  if (existing) {
    return failure("conflict", "This user is already a member of this class.");
  }

  const result = createEnrolledClassSchema.safeParse(
    enrollmentRecord(classroom, member),
  );
  if (result.error) {
    return failure("validation_failed", "Invalid user data provided.");
  }

  const data = await createEnrolledClass(result.data);
  if (!data) return failure("conflict", "Failed to add user to class.");

  await sendNotification(
    "addToClass" as never,
    data.userId,
    data.id,
    data.name,
    `/classroom/class/${data.classId}`,
    user.name,
    user.image as string,
  );

  return { ok: true, value: { enrollmentId: data.id } };
}
