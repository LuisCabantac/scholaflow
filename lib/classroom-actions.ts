"use server";

import { v4 as uuidv4 } from "uuid";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { format, parseISO, subHours } from "date-fns";

import { db } from "@/drizzle";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  chat,
  classroom,
  classTopic,
  classwork,
  enrolledClass,
  stream,
  streamComment,
  streamPrivateComment,
} from "@/drizzle/schema";
import {
  createChatSchema,
  createClassroomSchema,
  createClassTopicSchema,
  createClassworkSchema,
  createEnrolledClassSchema,
  createStreamCommentSchema,
  createStreamPrivateCommentSchema,
  createStreamSchema,
  editClassTopicSchema,
  editStreamSchema,
  Stream,
} from "@/lib/schema";
import { getUserByEmail, getUserByUserId } from "@/lib/user-service";
import {
  arraysAreEqual,
  capitalizeFirstLetter,
  extractClassworkFilePath,
  extractCommentFilePath,
  extractMessagesFilePath,
  extractStreamFilePath,
  generateClassCode,
} from "@/lib/utils";
import {
  getAllEnrolledClassesByClassAndSessionId,
  getAllEnrolledClassesByClassId,
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
  getEnrolledClassByEnrolledClassId,
  getEnrolledClassByUserAndClassId,
} from "@/lib/classroom-service";
import {
  getAllClassStreamsByClassId,
  getAllClassworkStreamsByTopicId,
  getClassStreamByStreamId,
} from "@/lib/stream-service";
import {
  getAllClassTopicsByClassId,
  getClassTopicByTopicId,
} from "@/lib/class-topic-service";
import {
  getAllMessagesByClassId,
  getAllMessagesByUserId,
} from "@/lib/message-service";
import {
  deleteAllNotificationsByResourceId,
  sendNotification,
} from "@/lib/notification-actions";
import {
  getAllCommentsByStreamId,
  getAllCommentsByUserId,
  getAllPrivateCommentsByStreamId,
  getAllPrivateCommentsByUserId,
  getStreamCommentByCommentId,
  getStreamPrivateCommentByCommentId,
} from "@/lib/comment-service";
import {
  getAllClassworksByClassAndUserId,
  getAllClassworksByStreamId,
  getClassworkByClassAndUserId,
} from "@/lib/classwork-service";

export async function createClass(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const newClass = {
    name: formData.get("className"),
    subject: formData.get("subject"),
    section: formData.get("section"),
    room: formData.get("room"),
    cardBackground: formData.get("color"),
    illustrationIndex: Math.floor(Math.random() * 5),
    code: generateClassCode(),
    teacherId: session.user.id,
    teacherName: session.user.name,
    teacherImage: session.user.image,
  };

  const result = createClassroomSchema.safeParse(newClass);

  if (result.error) {
    return {
      success: false,
      message:
        "Invalid class information provided. Please check all required fields and try again.",
    };
  }

  const [data] = await db
    .insert(classroom)
    .values(result.data)
    .returning({ id: classroom.id });

  revalidatePath("/classroom");

  return {
    success: true,
    message: "Class created successfully!",
    classUrl: `/classroom/class/${data.id}`,
  };
}

export async function updateClass(
  updateClassCode: boolean,
  formData: FormData,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const classroomId = formData.get("classroomId") as string;

  const currentClassroom = await getClassByClassId(classroomId);

  if (!currentClassroom)
    return {
      success: false,
      message: "This class doesn't exist.",
    };

  if (session.user.id !== currentClassroom.teacherId) {
    return {
      success: false,
      message: "Only the creator of this class can edit this class.",
    };
  }

  const newClassName = formData.get("className") as string;
  const newSubject = formData.get("subject") as string;
  const newSection = formData.get("section") as string | null;
  const newClassDescription = formData.get("classDescription") as string | null;
  const newAllowStudentsToComment =
    formData.get("allowStudentsToComment") === "true";
  const newClassCardBackgroundColor = formData.get("color") as string;
  const newAllowStudentsToPost = formData.get("allowStudentsToPost") === "true";

  if (
    updateClassCode ||
    currentClassroom.name !== newClassName ||
    currentClassroom.subject !== newSubject ||
    currentClassroom.teacherName !== session.user.name ||
    currentClassroom.teacherImage !== session.user.image ||
    currentClassroom.description !== newClassDescription ||
    currentClassroom.section !== newSection ||
    currentClassroom.cardBackground !== newClassCardBackgroundColor ||
    currentClassroom.allowUsersToComment !== newAllowStudentsToComment ||
    currentClassroom.allowUsersToPost !== newAllowStudentsToPost
  ) {
    const updatedClass = {
      name: newClassName,
      subject: newSubject,
      section: newSection ?? "",
      description: newClassDescription ?? "",
      teacherName: session.user.name,
      teacherImage: session.user.image as string,
      allowUsersToComment: newAllowStudentsToComment,
      allowUsersToPost: newAllowStudentsToPost,
      cardBackground: newClassCardBackgroundColor,
      code: updateClassCode ? generateClassCode() : currentClassroom.code,
    };

    const enrolledClasses = await getAllEnrolledClassesByClassId(classroomId);

    if (enrolledClasses?.length) {
      for (const enrolledClass of enrolledClasses) {
        await updateEnrolledClass(enrolledClass.id, {
          teacherName: session.user.name,
          teacherImage: session.user.image ?? "",
          name: newClassName as string,
          subject: newSubject as string,
          section: newSection as string,
          cardBackground: newClassCardBackgroundColor as string,
        });
      }
    }

    const result = createClassroomSchema.safeParse({
      ...currentClassroom,
      ...updatedClass,
    });

    if (result.error) {
      return {
        success: false,
        message:
          "Invalid class information provided. Please check all required fields and try again.",
      };
    }

    const [data] = await db
      .update(classroom)
      .set(updatedClass)
      .where(eq(classroom.id, classroomId))
      .returning();

    if (!data) {
      return {
        success: false,
        message:
          "Failed to update class information. Please check your connection and try again, or contact support if the issue persists.",
        classUrl: "",
      };
    }

    revalidatePath(`/classroom/class/${currentClassroom.id}`);
    revalidatePath("/classroom");

    return {
      success: true,
      message: "Class updated successfully!",
      classUrl: `/classroom/class/${classroomId}`,
    };
  }
  return {
    success: true,
    message: `No changes were made to the class.`,
    classUrl: "",
  };
}

async function updateEnrolledClass(
  enrolledClassId: string,
  updatedClass: {
    teacherName: string;
    teacherImage: string;
    name: string;
    section: string;
    subject: string | null;
    cardBackground: string;
  },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const [data] = await db
    .update(enrolledClass)
    .set(updatedClass)
    .where(eq(enrolledClass.id, enrolledClassId))
    .returning();

  if (!data)
    throw new Error("There was an error updating this enrolled class.");
}

export async function joinClass(classId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Only teachers and students can join classes.",
    };
  }

  const classroom = await getClassByClassId(classId);

  if (!classroom)
    return {
      success: false,
      message: "This class doesn't exist",
    };

  const newEnrolledClass = {
    classId: classroom.id,
    userId: session.user.id,
    userName: session.user.name,
    userImage: session.user.image as string,
    name: classroom.name,
    subject: classroom.subject,
    section: classroom.section,
    teacherName: classroom.teacherName,
    teacherImage: classroom.teacherImage,
    cardBackground: classroom.cardBackground,
    illustrationIndex: classroom.illustrationIndex,
  };

  const result = createEnrolledClassSchema.safeParse(newEnrolledClass);

  if (result.error) {
    return {
      success: false,
      message:
        "Invalid enrollment data. Please check if the class exists and try again.",
    };
  }

  const [data] = await db.insert(enrolledClass).values(result.data).returning();

  if (!data)
    return {
      success: false,
      message: "Failed to join the class. Please try again.",
    };

  await sendNotification(
    "join",
    classroom.teacherId,
    data.id,
    data.name,
    `/classroom/class/${data.classId}`,
  );

  revalidatePath("/classroom");

  return { success: true, message: "You've successfully joined the class!" };
}

export async function deleteClass(classId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return redirect("/signin");

  const currentClassroom = await getClassByClassId(classId);

  if (!currentClassroom) throw new Error("This class doesn't exist.");

  if (currentClassroom?.teacherId === session.user.id) {
    const classes = await getAllEnrolledClassesByClassAndSessionId(classId);
    if (classes?.length) {
      const classroomId = classes.map((curClass) => curClass.id);
      await deleteMultipleEnrolledClass(classroomId);
    }

    await deleteAllMessagesByClassId(classId);

    const streams = await getAllClassStreamsByClassId(classId);

    if (streams?.length) {
      for (const stream of streams) {
        await deleteClassStreamPost(stream.id);
      }
    }

    const topics = await getAllClassTopicsByClassId(classId);

    if (topics?.length) {
      for (const topic of topics) {
        await deleteTopic(topic.id);
      }
    }

    const [data] = await db
      .delete(classroom)
      .where(
        and(
          eq(classroom.id, classId),
          eq(classroom.teacherId, session.user.id),
        ),
      )
      .returning();

    revalidatePath("/classroom");

    if (!data) throw new Error("There was an error deleting this class.");

    return;
  }

  const currentEnrolledClass = await getEnrolledClassByClassAndSessionId(
    session.user.id,
    classId,
  );

  if (!currentEnrolledClass)
    throw new Error("You are not enrolled in this class.");

  await deleteAllClassworkByClassAndUserId(
    currentEnrolledClass.classId,
    currentEnrolledClass.userId,
  );

  const [data] = await db
    .delete(enrolledClass)
    .where(
      and(
        eq(enrolledClass.classId, classId),
        eq(enrolledClass.userId, session.user.id),
      ),
    )
    .returning();

  if (!data)
    throw new Error(
      "Failed to leave the class. The enrollment may not exist or has already been removed.",
    );

  await deleteAllNotificationsByResourceId(data.id);

  revalidatePath("/classroom");

  return;
}

export async function deleteAllMessagesByUserId(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  const messages = await getAllMessagesByUserId(userId);

  if (!messages || !messages.length) return;

  const attachments = messages.map((chat) => chat.attachments).flat();

  if (attachments.length) {
    const chatAttachmentsFilePath: string[] = attachments.map((file) =>
      extractMessagesFilePath(file),
    );
    await deleteFilesFromBucket("messages", chatAttachmentsFilePath);
  }

  const data = await db.delete(chat).where(eq(chat.userId, userId)).returning();

  if (!data.length)
    throw new Error(
      "Failed to delete user messages. No messages were found or the deletion operation was unsuccessful.",
    );

  return;
}

export async function deleteAllCommentsByUserId(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  const comments = await getAllCommentsByUserId(userId);

  if (!comments || !comments.length) return;

  const attachments = comments.map((comment) => comment.attachments).flat();

  if (attachments.length) {
    const chatAttachmentsFilePath: string[] = attachments.map((file) =>
      extractCommentFilePath(file),
    );
    await deleteFilesFromBucket("comments", chatAttachmentsFilePath);
  }

  const data = await db
    .delete(streamComment)
    .where(eq(streamComment.userId, userId))
    .returning();

  if (data.length) {
    const commentIds = data.map((comment) => comment.id);
    for (const id of commentIds) {
      await deleteAllNotificationsByResourceId(id);
    }
  }

  return;
}

export async function deleteAllPrivateCommentsByUserId(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  const comments = await getAllPrivateCommentsByUserId(userId);

  if (!comments || !comments.length) return;

  const attachments = comments.map((comment) => comment.attachments).flat();

  if (attachments.length) {
    const chatAttachmentsFilePath: string[] = attachments.map((file) =>
      extractCommentFilePath(file),
    );
    await deleteFilesFromBucket("comments", chatAttachmentsFilePath);
  }

  const data = await db
    .delete(streamPrivateComment)
    .where(eq(streamPrivateComment.userId, userId))
    .returning();

  if (data.length) {
    const commentIds = data.map((comment) => comment.id);
    for (const id of commentIds) {
      await deleteAllNotificationsByResourceId(id);
    }
  }

  return;
}

export async function deleteAllClassworkByClassAndUserId(
  classId: string,
  userId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  const classworks = await getAllClassworksByClassAndUserId(userId, classId);

  if (!classworks || !classworks.length) return;

  const attachments = classworks.map((chat) => chat.attachments).flat();

  if (attachments.length) {
    const classworkAttachmentsFilePath: string[] = attachments.map((file) =>
      extractClassworkFilePath(file),
    );
    await deleteFilesFromBucket("classworks", classworkAttachmentsFilePath);
  }

  const data = await db
    .delete(classwork)
    .where(and(eq(classwork.userId, userId), eq(classwork.classId, classId)))
    .returning();

  if (data.length) {
    const classworkIds = data.map((classwork) => classwork.id);
    for (const id of classworkIds) {
      await deleteAllNotificationsByResourceId(id);
    }
  }
}

export async function deleteMultipleEnrolledClass(classId: string[]) {
  for (const rowId of classId) {
    await deleteAllNotificationsByResourceId(rowId);
    await db.delete(enrolledClass).where(eq(enrolledClass.id, rowId));
  }
}

export async function deleteEnrolledClassbyClassAndEnrolledClassId(
  enrolledClassId: string,
  classId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const currentEnrolledClass =
    await getEnrolledClassByEnrolledClassId(enrolledClassId);
  if (!currentEnrolledClass)
    throw new Error("You are not a member of this class.");

  const classroom = await getClassByClassId(classId);

  if (!classroom) throw new Error("This class doesn't exist.");

  if (
    !(
      classroom.teacherId === session.user.id ||
      currentEnrolledClass.userId === session.user.id
    )
  )
    throw new Error("You're not authorized to remove this user.");

  await deleteAllClassworkByClassAndUserId(
    currentEnrolledClass.classId,
    currentEnrolledClass.userId,
  );

  const [data] = await db
    .delete(enrolledClass)
    .where(
      and(
        eq(enrolledClass.id, enrolledClassId),
        eq(enrolledClass.classId, classId),
      ),
    )
    .returning();

  if (data) {
    await deleteAllNotificationsByResourceId(data.id);
  }

  revalidatePath(`/classroom/class/${classId}/people`);
}

export async function createClassStreamPost(
  audience: string[],
  audienceIsAll: boolean,
  formData: FormData,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Admins and guests are not allowed to post to the class stream.",
    };
  }

  const classroom = await getClassByClassId(
    formData.get("classroomId") as string,
  );

  if (!classroom)
    return {
      success: false,
      message: "This class doesn't exist.",
    };

  if (classroom.teacherId !== session.user.id && !classroom.allowUsersToPost)
    return {
      success: false,
      message: "Students are not allowed to post to the class.",
    };

  const attachments = formData.getAll("attachments");
  const postAttachments = Array.isArray(attachments)
    ? await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment instanceof File && attachment.name !== "undefined") {
            return await uploadAttachments(
              "streams",
              formData.get("classroomId") as string,
              attachment,
            );
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const dueDate = formData.get("dueDate");

  const topicId = formData.get("topicId");
  const finalTopicId = topicId === "no-topic" ? null : topicId;

  const topic = finalTopicId
    ? await getClassTopicByTopicId(finalTopicId as string)
    : null;

  const newStream = {
    userId: session.user.id,
    userName: session.user.name,
    userImage: session.user.image,
    type: formData.get("streamType"),
    title: formData.get("title"),
    content: formData.get("caption"),
    classId: formData.get("classroomId"),
    className: classroom.name,
    announceTo: formData.getAll("announceTo") as string[] | null,
    announceToAll: audienceIsAll,
    attachments: postAttachments,
    links: formData.getAll("links"),
    dueDate: dueDate
      ? parseISO(
          format(
            subHours(parseISO(formData.get("scheduledAt") as string), 8),
            "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx",
          ),
        )
      : null,
    scheduledAt: formData.get("scheduledAt")
      ? parseISO(
          format(
            subHours(parseISO(formData.get("scheduledAt") as string), 8),
            "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx",
          ),
        )
      : null,
    acceptingSubmissions: formData.get("acceptingSubmissions") === "true",
    closeSubmissionsAfterDueDate:
      formData.get("closeSubmissionsAfterDueDate") === "true",
    points: formData.get("totalPoints"),
    topicId: topic?.id ?? null,
    topicName: topic?.name ?? null,
  };

  const result = createStreamSchema.safeParse(newStream);
  if (result.error) {
    return {
      success: false,
      message:
        "Invalid post data provided. Please check all required fields and try again.",
    };
  }

  const [data] = await db.insert(stream).values(result.data).returning();
  if (!data)
    return {
      success: false,
      message:
        "Failed to publish post. Please check your connection and try again, or contact support if the issue persists.",
    };

  revalidatePath(`/classroom/class/${formData.get("classroomId")}`);
  revalidatePath(`/classroom/class/${formData.get("classroomId")}/classwork`);

  await sendNotification(
    data.type,
    newStream.announceTo ?? [],
    data.id,
    data.title ?? data.content ?? "",
    `/classroom/class/${data.classId}/stream/${data.id}`,
  );

  return {
    success: true,
    message: `${(formData.get("streamType") as string) === "stream" ? "Post" : capitalizeFirstLetter((formData.get("streamType") as string) ?? "")} published!`,
  };
}

export async function updateClassStreamPost(
  audience: string[],
  audienceIsAll: boolean,
  curUrlLinks: string[],
  curAttachments: string[],
  formData: FormData,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Only the original author can edit this post.",
    };
  }

  const currentStream = await getClassStreamByStreamId(
    formData.get("streamId") as string,
  );

  if (!currentStream)
    return {
      success: false,
      message: "This post doesn't exist in this class.",
    };

  if (currentStream.userId !== session.user.id)
    return {
      success: false,
      message: "This class stream can only be edited by the one who posted it.",
    };

  const newAttachments = formData.getAll("attachments");
  const newUrlLinks = formData.getAll("links");
  const newCaption = formData.get("caption");
  const newTitle = formData.get("title");
  const newDueDate = formData.get("dueDate")
    ? parseISO(
        format(
          formData.get("dueDate") as string,
          "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx",
        ),
      )
    : null;
  const newPoints = formData.get("totalPoints");
  const topicId = formData.get("topicId");
  const newTopicId = topicId === "no-topic" ? null : topicId;
  const newScheduledAt = formData.get("scheduledAt")
    ? parseISO(
        format(
          formData.get("scheduledAt") as string,
          "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx",
        ),
      )
    : null;
  const newAcceptingSubmissions =
    formData.get("acceptingSubmissions") === "true";
  const newCloseSubmissionsAfterDueDate =
    formData.get("closeSubmissionsAfterDueDate") === "true";

  const topic = await getClassTopicByTopicId(newTopicId as string);

  if (
    currentStream.content !== newCaption ||
    currentStream.topicId !== (topic?.id || null) ||
    currentStream.announceToAll !== audienceIsAll ||
    newAttachments.length ||
    newUrlLinks.length ||
    currentStream.points !== newPoints ||
    currentStream.title !== newTitle ||
    (currentStream.scheduledAt
      ? format(currentStream.scheduledAt, "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx")
      : null) !== newScheduledAt ||
    newAcceptingSubmissions !== currentStream.acceptingSubmissions ||
    newCloseSubmissionsAfterDueDate !==
      currentStream.closeSubmissionsAfterDueDate ||
    (currentStream.dueDate
      ? format(currentStream.dueDate, "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx")
      : null) !== newDueDate ||
    arraysAreEqual(audience, currentStream.announceTo) === false ||
    arraysAreEqual(curAttachments, currentStream.attachments) === false ||
    arraysAreEqual(curUrlLinks, currentStream.links) === false
  ) {
    const removedAttachments = currentStream.attachments.filter(
      (attachment) => !curAttachments.includes(attachment),
    );
    if (removedAttachments.length) {
      const filePath = removedAttachments.map((file) =>
        extractStreamFilePath(file),
      );
      await deleteFilesFromBucket("streams", filePath);
    }

    const postAttachments = Array.isArray(newAttachments)
      ? await Promise.all(
          newAttachments.map(async (attachment) => {
            if (
              attachment instanceof File &&
              attachment.name !== "undefined" &&
              attachment.size > 0
            ) {
              return await uploadAttachments(
                "streams",
                formData.get("classroomId") as string,
                attachment,
              );
            } else {
              return null;
            }
          }),
        ).then((results) => results.filter((url) => url !== null))
      : [];

    const updatedStream = {
      title: newTitle,
      content: formData.get("caption") as string | null,
      announceTo: audience,
      announceToAll: audienceIsAll,
      attachments: postAttachments.concat(curAttachments),
      links: newUrlLinks.concat(curUrlLinks),
      dueDate: newDueDate
        ? parseISO(
            format(
              subHours(parseISO(formData.get("dueDate") as string), 8),
              "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx",
            ),
          )
        : null,
      scheduledAt: formData.get("scheduledAt")
        ? parseISO(
            format(
              subHours(parseISO(formData.get("scheduledAt") as string), 8),
              "yyyy-MM-dd'T'HH:mm:ss.SSSSSSxxx",
            ),
          )
        : null,
      points: newPoints ? Number(newPoints) : null,
      acceptingSubmissions: newAcceptingSubmissions,
      closeSubmissionsAfterDueDate: newCloseSubmissionsAfterDueDate,
      topicId: topic?.id ?? null,
      topicName: topic?.name ?? null,
      updatedAt: new Date(),
    };

    const result = editStreamSchema.safeParse(updatedStream);

    if (result.error) {
      return {
        success: false,
        message:
          "Invalid data provided for stream update. Please check your input and try again.",
      };
    }

    const [data] = await db
      .update(stream)
      .set(result.data)
      .where(eq(stream.id, formData.get("streamId") as string))
      .returning();

    if (!data) {
      return {
        success: false,
        message:
          "Failed to update the post. Please check your connection and try again, or contact support if the issue persists.",
      };
    }

    revalidatePath(`/classroom/class/${formData.get("classroomId")}`);
    revalidatePath(`/classroom/class/${formData.get("classroomId")}/classwork`);

    return {
      success: true,
      message: `${(formData.get("streamType") as string) === "stream" ? "Post" : capitalizeFirstLetter((formData.get("streamType") as string) ?? "")} updated successfully!`,
    };
  }
  return {
    success: true,
    message: `No changes were made to the ${(formData.get("streamType") as string) === "stream" ? "post" : (formData.get("streamType") as string)}.`,
  };
}

export async function deleteClassStreamPost(streamId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const currentStream = await getClassStreamByStreamId(streamId);

  if (!currentStream) throw new Error("This post doesn't exist in this class.");

  const classroom = await getClassByClassId(currentStream.classId);

  if (!classroom) throw new Error("This class doesn't exist.");

  if (
    !(
      currentStream.userId === session.user.id ||
      classroom.teacherId === session.user.id
    )
  )
    throw new Error("You're not authorized to delete this post.");

  await deleteAllClassStreamCommentsByStreamId(streamId);

  await deleteAllPrivateStreamCommentsByStreamId(streamId);

  await deleteAllClassworkByStreamId(streamId);

  if (currentStream.attachments.length) {
    const streamAttachmentsFilePath = currentStream.attachments.map((file) =>
      extractStreamFilePath(file),
    );
    await deleteFilesFromBucket("streams", streamAttachmentsFilePath);
  }

  await deleteAllNotificationsByResourceId(streamId);

  const [data] = await db
    .delete(stream)
    .where(eq(stream.id, streamId))
    .returning();

  revalidatePath(`/classroom/class/${classroom.id}`);
  revalidatePath(`/classroom/class/${classroom.id}/classwork`);

  if (!data)
    throw new Error(
      "Failed to delete the post. The post may not exist or you may not have permission to delete it.",
    );
}

export async function deleteAllClassworkByStreamId(streamId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  const classworks = await getAllClassworksByStreamId(streamId);

  if (!classworks || !classworks.length) return;

  const classworkIds = classworks.map((classwork) => classwork.id);
  if (classworkIds.length) {
    for (const id in classworkIds) {
      await deleteAllNotificationsByResourceId(id);
    }
  }

  const attachments = classworks.map((chat) => chat.attachments).flat();

  if (attachments.length) {
    const classworkAttachmentsFilePath: string[] = attachments.map((file) =>
      extractClassworkFilePath(file),
    );
    await deleteFilesFromBucket("classworks", classworkAttachmentsFilePath);
  }

  const data = await db
    .delete(classwork)
    .where(eq(classwork.streamId, streamId))
    .returning();

  if (!data.length)
    throw new Error(
      "There was an error deleting all classwork for this stream.",
    );
}

export async function deleteAllMessagesByClassId(classId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  const messages = await getAllMessagesByClassId(classId);

  if (!messages || !messages.length) return;

  const attachments = messages.map((chat) => chat.attachments).flat();

  if (attachments.length) {
    const chatAttachmentsFilePath: string[] = attachments.map((file) =>
      extractMessagesFilePath(file),
    );
    await deleteFilesFromBucket("messages", chatAttachmentsFilePath);
  }

  const data = await db
    .delete(chat)
    .where(eq(chat.classId, classId))
    .returning();

  if (!data.length)
    throw new Error(
      "Failed to delete messages for this class. The messages may not exist or there was an issue with the deletion operation.",
    );
}

export async function deleteAllClassStreamCommentsByStreamId(streamId: string) {
  const comments = await getAllCommentsByStreamId(streamId);

  if (!comments?.length) return;

  const commentIds = comments.map((comment) => comment.id);
  if (commentIds.length) {
    for (const id in commentIds) {
      await deleteAllNotificationsByResourceId(id);
    }
  }

  const attachments = comments.map((comment) => comment.attachments).flat();
  if (attachments.length) {
    const filePath = attachments.map((file) => extractCommentFilePath(file));
    await deleteFilesFromBucket("comments", filePath);
  }

  await db.delete(streamComment).where(eq(streamComment.streamId, streamId));
}

export async function deleteAllPrivateStreamCommentsByStreamId(
  streamId: string,
) {
  const privateComments = await getAllPrivateCommentsByStreamId(streamId);

  if (!privateComments?.length) return;

  const commentIds = privateComments.map((comment) => comment.id);
  if (commentIds.length) {
    for (const id in commentIds) {
      await deleteAllNotificationsByResourceId(id);
    }
  }

  const attachments = privateComments
    .map((comment) => comment.attachments)
    .flat();
  if (attachments.length) {
    const filePath = attachments.map((file) => extractCommentFilePath(file));
    await deleteFilesFromBucket("comments", filePath);
  }

  await db
    .delete(streamPrivateComment)
    .where(eq(streamPrivateComment.streamId, streamId));
}

export async function deleteAllPrivateStreamCommentsByClassId(classId: string) {
  const data = await db
    .delete(streamPrivateComment)
    .where(eq(streamPrivateComment.classId, classId))
    .returning();

  if (data.length) {
    const commentIds = data.map((comment) => comment.id);
    for (const id in commentIds) {
      await deleteAllNotificationsByResourceId(id);
    }
  }
}

export async function deleteStreamComment(
  clasroomId: string,
  streamId: string,
  commentId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const classroom = await getClassByClassId(clasroomId);

  if (!classroom) throw new Error("This class doesn't exist.");

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) throw new Error("This post doesn't exist in this class.");

  const comment = await getStreamCommentByCommentId(commentId);

  if (!comment) throw new Error("This comment doesn't exist on this post.");

  if (
    !(
      comment.userId === session.user.id ||
      classroom.teacherId === session.user.id
    )
  )
    throw new Error("You're not authorized to delete this comment.");

  if (comment.attachments?.length) {
    const filePath = comment.attachments.map((file) =>
      extractCommentFilePath(file),
    );
    await deleteFilesFromBucket("comments", filePath);
  }

  const [data] = await db
    .delete(streamComment)
    .where(
      and(
        eq(streamComment.id, commentId),
        eq(streamComment.streamId, streamId),
      ),
    )
    .returning();

  if (data) await deleteAllNotificationsByResourceId(data.id);
}

export async function addCommentToStream(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const classroom = await getClassByClassId(
    formData.get("classroomId") as string,
  );

  if (!classroom) throw new Error("This class doesn't exist.");

  const enrolledClass = await getEnrolledClassByClassAndSessionId(
    session.user.id,
    formData.get("classroomId") as string,
  );

  if (
    !(
      classroom.teacherId === session.user.id ||
      enrolledClass ||
      classroom.allowUsersToComment
    )
  ) {
    throw new Error("You don't have permission to comment on this post.");
  }

  const attachments = formData.getAll("attachments");
  const commentAttachments = Array.isArray(attachments)
    ? await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment instanceof File && attachment.name !== "undefined") {
            return await uploadAttachments(
              "comments",
              formData.get("classroomId") as string,
              attachment,
            );
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const newComment = {
    streamId: formData.get("streamId"),
    classId: formData.get("classroomId"),
    userId: session.user.id,
    userName: session.user.name,
    userImage: session.user.image,
    content: formData.get("comment"),
    attachments: commentAttachments,
  };

  const result = createStreamCommentSchema.safeParse(newComment);

  if (result.error) {
    throw new Error(
      "Invalid comment data provided. Please check all required fields and try again.",
    );
  }

  const [data] = await db.insert(streamComment).values(result.data).returning();

  if (data) {
    await sendNotification(
      "comment",
      classroom.teacherId,
      data.id,
      data.content ?? (data.attachments.length ? "Commented an image" : ""),
      `/classroom/class/${data.classId}/stream/${data.streamId}?comment=${data.id}`,
    );
  }

  if (!data) {
    throw new Error(
      "Failed to save comment. Please try again or contact support if the issue persists.",
    );
  }
}

export async function addPrivateComment(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const classroomId = formData.get("classroomId") as string;
  const streamId = formData.get("streamId") as string;
  const userId = formData.get("userId") as string;

  const classroom = await getClassByClassId(classroomId);

  if (!classroom) throw new Error("This class doesn't exist.");

  const enrolledClass = await getEnrolledClassByClassAndSessionId(
    session.user.id,
    classroomId,
  );

  if (!(classroom?.teacherId === session.user.id || enrolledClass)) {
    throw new Error("You don't have permission to comment.");
  }

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) throw new Error("This stream doesn't exist.");

  if (
    !(
      stream.announceToAll ||
      session.user.id === classroom.teacherId ||
      stream.announceTo.includes(session.user.id)
    )
  ) {
    throw new Error("You don't have permission to comment on this classwork.");
  }

  const attachments = formData.getAll("attachments");
  const commentAttachments = Array.isArray(attachments)
    ? await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment instanceof File && attachment.name !== "undefined") {
            return await uploadAttachments(
              "comments",
              formData.get("classroomId") as string,
              attachment,
            );
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const newPrivateComment = {
    streamId: formData.get("streamId") as string,
    classId: formData.get("classroomId") as string,
    userId: session.user.id,
    userName: session.user.name,
    userImage: session.user.image,
    content: formData.get("comment") as string,
    attachments: commentAttachments,
    toUserId:
      session.user.id === classroom.teacherId ? userId : classroom.teacherId,
  };

  const result = createStreamPrivateCommentSchema.safeParse(newPrivateComment);

  if (result.error) {
    throw new Error(
      "Invalid private comment data provided. Please check all required fields and try again.",
    );
  }

  const [data] = await db
    .insert(streamPrivateComment)
    .values(result.data)
    .returning();

  if (!data) {
    throw new Error(
      "Failed to save private comment. Please try again or contact support if the issue persists.",
    );
  }

  if (data) {
    await sendNotification(
      "comment",
      classroom.teacherId,
      data.id,
      data.content ?? (data.attachments.length ? "Commented an image" : ""),
      `/classroom/class/${data.classId}/stream/${data.streamId}/submissions?name=${data.userName.toLowerCase().replace(/\s+/g, "-")}&user=${data.userId}&comment=${data.id}`,
    );
  }
}

export async function deletePrivateComment(
  clasroomId: string,
  streamId: string,
  commentId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const classroom = await getClassByClassId(clasroomId);

  if (!classroom) throw new Error("This class doesn't exist.");

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) throw new Error("This post doesn't exist in this class.");

  const comment = await getStreamPrivateCommentByCommentId(commentId);

  if (!comment) throw new Error("This comment doesn't exist on this post.");

  if (
    !(
      comment.userId === session.user.id ||
      classroom.teacherId === session.user.id
    )
  )
    throw new Error("You're not authorized to delete this comment.");

  if (comment.attachments?.length) {
    const filePath = comment.attachments.map((file) =>
      extractCommentFilePath(file),
    );
    await deleteFilesFromBucket("comments", filePath);
  }

  const [data] = await db
    .delete(streamPrivateComment)
    .where(
      and(
        eq(streamPrivateComment.id, commentId),
        eq(streamPrivateComment.streamId, streamId),
      ),
    )
    .returning();

  if (!data)
    throw new Error(
      "Failed to delete the private comment. The comment may not exist or you may not have permission to delete it.",
    );

  if (data) {
    await deleteAllNotificationsByResourceId(data.id);
  }
}

export async function addUserToClass(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Only teachers can add users to this class.",
    };
  }

  const classroomId = formData.get("classroomId") as string;
  const userEmail = formData.get("email") as string;

  const classroom = await getClassByClassId(classroomId);

  if (!classroom)
    return {
      success: false,
      message: "This class doesn't exist.",
    };

  const user = await getUserByEmail(userEmail);

  if (!user)
    return {
      success: false,
      message: "No account found for this email address.",
    };

  if (classroom.teacherId === user.id)
    return {
      success: false,
      message: "This user is already a member of this class.",
    };

  if (user.role === "admin")
    return {
      success: false,
      message: "This class can only include students and teachers.",
    };

  const currentEnrolledClass = await getEnrolledClassByUserAndClassId(
    user.id,
    classroomId,
  );

  if (currentEnrolledClass)
    return {
      success: false,
      message: "This user is already a member of this class.",
    };

  const newClass = {
    classId: classroom.id,
    userId: user.id,
    userName: user.name,
    userImage: user.image,
    name: classroom.name,
    subject: classroom.subject,
    section: classroom.section,
    teacherName: classroom.teacherName,
    teacherImage: classroom.teacherImage,
    cardBackground: classroom.cardBackground,
    illustrationIndex: classroom.illustrationIndex,
  };

  const result = createEnrolledClassSchema.safeParse(newClass);

  if (result.error) {
    return {
      success: false,
      message:
        "Invalid user data provided. Please check the email address and try again.",
    };
  }

  const [data] = await db.insert(enrolledClass).values(result.data).returning();

  if (!data) {
    return {
      success: false,
      message:
        "Failed to add user to class. Please check your connection and try again, or contact support if the issue persists.",
    };
  }

  if (data) {
    await sendNotification(
      "addToClass",
      data.userId,
      data.id,
      data.name,
      `/classroom/class/${data.classId}`,
    );
  }

  revalidatePath(`/classroom/`);

  return {
    success: true,
    message: "User successfully added to class!",
  };
}

export async function uploadAttachments(
  bucketName: string,
  classroomId: string,
  file: File,
) {
  if (file.name !== "undefined") {
    const sanitizedFileName = file.name.replace(/~/g, "").replace(/\s+/g, "_");
    const [name, extension] = sanitizedFileName.split(/\.(?=[^\.]+$)/);
    const { data: attachment, error } = await supabase.storage
      .from(`${bucketName}/${classroomId}`)
      .upload(`${name}_${uuidv4()}.${extension}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(`${bucketName}/${classroomId}`)
      .getPublicUrl(attachment.path);
    return publicUrl;
  }
}

export async function deleteFilesFromBucket(
  bucketName: string,
  filePath: string[],
) {
  const { error } = await supabase.storage.from(bucketName).remove(filePath);

  if (error)
    throw new Error(
      `${filePath} cannot be deleted from the ${bucketName} bucket`,
    );
}

export async function submitClasswork(
  classId: string,
  streamId: string,
  formData: FormData,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Admins and guests are not allowed to post to the class stream.",
    };
  }

  const classroom = await getClassByClassId(classId);

  if (!classroom)
    return {
      success: false,
      message: "This class doesn't exist.",
    };

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream)
    return {
      success: false,
      message: "This stream does not exist.",
    };

  if (!(stream.announceToAll || stream.announceTo.includes(session.user.id)))
    return {
      success: false,
      message: "You can't submit",
    };

  const attachments = formData.getAll("attachments");
  const postAttachments = Array.isArray(attachments)
    ? await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment instanceof File && attachment.name !== "undefined") {
            return await uploadAttachments("classworks", classId, attachment);
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const newClasswork = {
    userId: session.user.id,
    userName: session.user.name,
    userImage: session.user.image,
    classId: classId,
    className: classroom.name,
    streamCreatedAt: stream.createdAt,
    title: stream.title,
    streamId,
    attachments: postAttachments,
    links: formData.getAll("links"),
    turnedInDate: new Date(),
    isTurnedIn: true,
    isGraded: false,
    points: null,
    isReturned: false,
  };

  const result = createClassworkSchema.safeParse(newClasswork);

  if (result.error) {
    return {
      success: false,
      message:
        "Invalid classwork data provided. Please check all required fields and try again.",
    };
  }

  const [data] = await db.insert(classwork).values(result.data).returning();

  if (!data) {
    return {
      success: false,
      message:
        "Failed to submit classwork. Please check your connection and try again, or contact support if the issue persists.",
    };
  }

  await sendNotification(
    "submit",
    data.userId,
    data.id,
    stream.title ?? stream.content ?? "",
    `/classroom/class/${data.classId}/stream/${data.streamId}/submissions?name=${data.userName.toLowerCase().replace(/\s+/g, "-")}&user=${data.userId}`,
  );

  revalidatePath(`/classroom/class/${classId}/stream/${streamId}`);

  return { success: true, message: "Classwork submitted!" };
}

export async function updateClasswork(
  curUrlLinks: string[],
  curAttachments: string[],
  formData: FormData,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Only the original author can edit this post.",
    };
  }

  const currentClasswork = await getClassworkByClassAndUserId(
    session.user.id,
    formData.get("classroomId") as string,
    formData.get("streamId") as string,
  );

  if (!currentClasswork)
    return {
      success: false,
      message: "This post doesn't exist in this class.",
    };

  const newAttachments = formData.getAll("attachments");
  const newUrlLinks = formData.getAll("links");
  const newIsTurnedIn = formData.get("isTurned") === "true";

  if (
    newAttachments.length ||
    newUrlLinks.length ||
    newIsTurnedIn === currentClasswork.isTurnedIn ||
    arraysAreEqual(curAttachments, currentClasswork.attachments ?? []) ===
      false ||
    arraysAreEqual(curUrlLinks, currentClasswork.links ?? []) === false
  ) {
    const removedAttachments = currentClasswork.attachments?.filter(
      (attachment) => !curAttachments.includes(attachment),
    );
    if (removedAttachments?.length) {
      const filePath = removedAttachments.map((file) =>
        extractClassworkFilePath(file),
      );
      await deleteFilesFromBucket("classworks", filePath);
    }

    const postAttachments = Array.isArray(newAttachments)
      ? await Promise.all(
          newAttachments.map(async (attachment) => {
            if (
              attachment instanceof File &&
              attachment.name !== "undefined" &&
              attachment.size > 0
            ) {
              return await uploadAttachments(
                "classworks",
                formData.get("classroomId") as string,
                attachment,
              );
            } else {
              return null;
            }
          }),
        ).then((results) => results.filter((url) => url !== null))
      : [];

    const updatedClasswork = {
      ...currentClasswork,
      attachments: postAttachments.concat(curAttachments),
      links: newUrlLinks.concat(curUrlLinks),
      turnedInDate: new Date(),
      isTurnedIn: true,
    };

    const result = createClassworkSchema.safeParse(updatedClasswork);

    if (result.error) {
      return {
        success: false,
        message:
          "Invalid classwork data provided. Please check your submission and try again.",
      };
    }

    const [data] = await db
      .update(classwork)
      .set(result.data)
      .where(eq(classwork.id, formData.get("classworkId") as string))
      .returning();

    if (!data) {
      return {
        success: false,
        message:
          "Failed to update classwork. Please check your connection and try again, or contact support if the issue persists.",
      };
    }

    revalidatePath(
      `/classroom/class/${formData.get("classroomId")}/stream/${formData.get("streamId")}`,
    );

    return { success: true, message: "Classwork updated successfully!" };
  }
  return {
    success: true,
    message: "No changes were made to the classwork.",
  };
}

export async function unsubmitClasswork(
  classworkId: string,
  classroomId: string,
  streamId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") {
    return {
      success: false,
      message: "Only the original author can edit this post.",
    };
  }

  const currentClasswork = await getClassworkByClassAndUserId(
    session.user.id,
    classroomId,
    streamId,
  );

  if (!currentClasswork)
    return {
      success: false,
      message: "This post doesn't exist in this class.",
    };

  const updatedClasswork = {
    isTurnedIn: false,
  };

  const [data] = await db
    .update(classwork)
    .set(updatedClasswork)
    .where(eq(classwork.id, classworkId))
    .returning();

  if (!data) {
    return {
      success: false,
      message:
        "Failed to unsubmit classwork. Please check your connection and try again, or contact support if the issue persists.",
    };
  }

  revalidatePath(`/classroom/class/${classroomId}/stream/${streamId}`);

  return { success: true, message: "Your classwork has been unsubmitted." };
}

export async function addGradeClasswork(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const userId = formData.get("userId") as string;
  const streamId = formData.get("streamId") as string;
  const classId = formData.get("classroomId") as string;
  const classworkId = formData.get("classworkId") as string;
  const userPoints = formData.get("userPoints")
    ? Number(formData.get("userPoints"))
    : null;

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream)
    return {
      success: false,
      message: "This classwork doesn't exist in this class.",
    };

  if (!stream.announceToAll && !stream.announceTo.includes(userId))
    return {
      success: false,
      message: "This user isn't assigned in this classwork.",
    };

  const currentClasswork = await getClassworkByClassAndUserId(
    userId,
    classId,
    streamId,
  );

  if (!currentClasswork) {
    const newClasswork = await createEmptyClasswork(
      userId,
      classId,
      streamId,
      userPoints,
    );
    if (!newClasswork)
      return { success: false, message: "User can not be added." };

    revalidatePath(`/classroom/class/${classId}/stream/${streamId}`);

    return { success: true, message: "Grade has been added to this user." };
  }

  if (currentClasswork.points !== userPoints) {
    const updatedClasswork = {
      ...currentClasswork,
      points: userPoints,
      isGraded: true,
    };

    const result = createClassworkSchema.safeParse(updatedClasswork);

    if (result.error) {
      return {
        success: false,
        message:
          "Invalid grade data provided. Please check the grade value and try again.",
      };
    }

    const [data] = await db
      .update(classwork)
      .set(updatedClasswork)
      .where(eq(classwork.id, classworkId))
      .returning();

    if (!data) {
      return {
        success: false,
        message:
          "Failed to update the grade. Please check your connection and try again, or contact support if the issue persists.",
      };
    }

    revalidatePath(`/classroom/class/${classId}/stream/${streamId}`);

    await sendNotification(
      "grade",
      data.userId,
      data.id,
      data.points !== null
        ? `Grade received: ${userPoints}${stream.points ? `/${stream.points}` : ""} points`
        : "Your work has been reviewed",
      `/classroom/class/${classId}/stream/${streamId}`,
    );

    return { success: true, message: "Grade has been added to this user." };
  }

  return { success: true, message: "No changes were made to the classwork." };
}

export async function createEmptyClasswork(
  userId: string,
  classId: string,
  streamId: string,
  userPoints?: number | null,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const classroom = await getClassByClassId(classId);

  if (!classroom) throw new Error("This class does not exist.");

  if (session.user?.id !== classroom.teacherId)
    throw new Error("Only teachers can do this operation.");

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) throw new Error("This stream does not exist.");

  const user = await getUserByUserId(userId);

  if (!user) throw new Error("This user does not exist.");

  const enrolledUser = await getEnrolledClassByUserAndClassId(user.id, classId);

  if (!enrolledUser) throw new Error("This user is not enrolled in this class");

  const newClasswork = {
    userId: user.id,
    userName: user.name,
    userImage: user.image,
    classId: classId,
    className: classroom.name,
    streamId,
    title: stream.title,
    attachments: [],
    links: [],
    points: userPoints,
    isGraded:
      userPoints !== undefined &&
      userPoints !== null &&
      Number.isFinite(userPoints) &&
      userPoints >= 0,
    isReturned: false,
    streamCreatedAt: stream.createdAt,
    isTurnedIn: false,
    turnedInDate: null,
  };

  const result = createClassworkSchema.safeParse(newClasswork);

  if (result.error) {
    throw new Error(
      "Invalid classwork data provided. Please check all required fields and try again.",
    );
  }

  const [data] = await db.insert(classwork).values(result.data).returning();

  if (!data)
    throw new Error(
      "Failed to create empty classwork entry. The classwork may not have been saved properly.",
    );

  return data;
}

export async function addMessageToChat(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const classroom = await getClassByClassId(
    formData.get("classroomId") as string,
  );

  if (!classroom) throw new Error("This class doesn't exist.");

  const enrolledClass = await getEnrolledClassByClassAndSessionId(
    session.user.id,
    formData.get("classroomId") as string,
  );

  if (!(classroom.teacherId === session.user.id || enrolledClass)) {
    throw new Error(
      "You don't have permission to send a message on this class.",
    );
  }

  const attachments = formData.getAll("attachments");
  const chatAttachments = Array.isArray(attachments)
    ? await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment instanceof File && attachment.name !== "undefined") {
            return await uploadAttachments(
              "messages",
              formData.get("classroomId") as string,
              attachment,
            );
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const newChat = {
    userId: session.user.id,
    userName: session.user.name,
    userImage: session.user.image,
    message: formData.get("message"),
    classId: formData.get("classroomId"),
    attachments: chatAttachments,
  };

  const result = createChatSchema.safeParse(newChat);

  if (result.error) {
    throw new Error(
      "Invalid message data provided. Please check all required fields and try again.",
    );
  }

  const [data] = await db.insert(chat).values(result.data).returning();

  if (!data) {
    throw new Error(
      "Failed to send message. Please check your connection and try again, or contact support if the issue persists.",
    );
  }
}

export async function createTopic(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const classroomId = formData.get("classroomId") as string;

  const classroom = await getClassByClassId(classroomId);

  if (!classroom)
    return {
      success: false,
      message: "This class does not exist.",
    };

  if (session.user.id !== classroom.teacherId) {
    return {
      success: false,
      message: "Only the creator of this class can create topics.",
    };
  }

  const newTopic = {
    name: formData.get("topicName"),
    classId: formData.get("classroomId"),
  };

  const result = createClassTopicSchema.safeParse(newTopic);

  if (result.error) {
    return {
      success: false,
      message:
        "Invalid topic data provided. Please check the topic name and try again.",
    };
  }

  const [data] = await db.insert(classTopic).values(result.data).returning();

  if (!data) {
    return {
      success: false,
      message:
        "Failed to create topic. Please check your connection and try again, or contact support if the issue persists.",
    };
  }

  revalidatePath("/classroom");

  return { success: true, message: "Topic created successfully!" };
}

export async function updateTopic(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const classroomId = formData.get("classroomId") as string;

  const classroom = await getClassByClassId(classroomId);

  if (!classroom)
    return {
      success: false,
      message: "This class does not exist.",
    };

  if (session.user.id !== classroom.teacherId) {
    return {
      success: false,
      message: "Only the creator of this class can edit topics.",
    };
  }

  const topicId = formData.get("topicId");
  const finalTopicId = topicId === "no-topic" ? null : topicId;

  const currentTopic = finalTopicId
    ? await getClassTopicByTopicId(finalTopicId as string)
    : null;

  if (!currentTopic)
    return {
      success: false,
      message: "This topic doesn't exist.",
    };

  const newTopicName = formData.get("topicName");

  if (newTopicName !== currentTopic.name) {
    const updatedTopic = {
      name: newTopicName,
    };

    const classworkStream = await getAllClassworkStreamsByTopicId(
      currentTopic.id,
    );

    if (classworkStream?.length) {
      for (const stream of classworkStream) {
        await updateClassStreamPostTopic(
          "edit",
          stream,
          newTopicName as string,
        );
      }
    }

    const result = editClassTopicSchema.safeParse(updatedTopic);

    if (result.error) {
      return {
        success: false,
        message:
          "Invalid topic data provided. Please check the topic name and try again.",
      };
    }

    const [data] = await db
      .update(classTopic)
      .set(result.data)
      .where(eq(classTopic.id, currentTopic.id))
      .returning();

    if (!data) {
      return {
        success: false,
        message:
          "Failed to update topic. Please check your connection and try again, or contact support if the issue persists.",
      };
    }

    revalidatePath(`/classroom/class/${currentTopic.classId}/classworks`);

    return { success: true, message: "Topic updated successfully!" };
  }
  return {
    success: true,
    message: `No changes were made to the topic.`,
  };
}

export async function deleteTopic(topicId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const topic = await getClassTopicByTopicId(topicId);

  if (!topic) throw new Error("This topic does not exist.");

  const classroom = await getClassByClassId(topic.classId);

  if (!classroom) throw new Error("This class does not exist.");

  if (session.user.id !== classroom.teacherId)
    throw new Error("Only the creator of this class can delete topics.");

  const classworkStream = await getAllClassworkStreamsByTopicId(topicId);

  if (classworkStream?.length) {
    for (const stream of classworkStream) {
      await updateClassStreamPostTopic("delete", stream);
    }
  }

  const [data] = await db
    .delete(classTopic)
    .where(eq(classTopic.id, topicId))
    .returning();

  if (!data)
    throw new Error(
      "Failed to delete topic. The topic may not exist or the deletion operation was unsuccessful.",
    );

  revalidatePath(`/classroom/class/${topic.classId}/classworks`);
}

export async function updateClassStreamPostTopic(
  type: "edit" | "delete",
  streamData: Stream,
  topicName?: string,
) {
  if (type === "edit") {
    const [data] = await db
      .update(stream)
      .set({ topicName: topicName ?? null })
      .where(eq(stream.id, streamData.id))
      .returning();

    if (!data)
      throw new Error(
        "Failed to update stream topic. The stream may not exist or the update operation was unsuccessful.",
      );
  }
  if (type === "delete") {
    const [data] = await db
      .update(stream)
      .set({ topicName: null, topicId: null })
      .where(eq(stream.id, streamData.id))
      .returning();

    if (!data)
      throw new Error(
        "Failed to remove topic from stream. The stream may not exist or the operation was unsuccessful.",
      );
  }
}
