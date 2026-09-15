import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { createChatSchema } from "@/lib/schema";
import { uploadAttachments } from "@/services/storage";
import { extractMessagesFilePath } from "@/lib/utils";
import { deleteFilesFromBucket } from "@/services/user-management";
import {
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/services/classroom";
import {
  addMessageToChatRecord,
  getAllMessagesByUserId,
  getAllMessagesByClassId,
  deleteAllMessagesByUserId,
  deleteAllMessagesByClassIdRecord,
} from "@/services/message";

export const getAllMessagesByClassIdFn = createServerFn({ method: "GET" })
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const classroom = await getClassByClassId(classId);
    if (!classroom) return null;

    const enrolledClass = await getEnrolledClassByClassAndSessionId(
      session.user.id,
      classId,
    );

    if (!(classroom.teacherId === session.user.id || enrolledClass))
      return null;

    return await getAllMessagesByClassId(classId);
  });

export const getAllMessagesByUserIdFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllMessagesByUserId(userId);
  });

export const addMessageToChatFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const classroomId = formData.get("classroomId") as string;
    const classroom = await getClassByClassId(classroomId);

    if (!classroom)
      return { success: false, message: "This class doesn't exist." };

    const enrolledClass = await getEnrolledClassByClassAndSessionId(
      session.user.id,
      classroomId,
    );

    if (!(classroom.teacherId === session.user.id || enrolledClass)) {
      return {
        success: false,
        message: "You don't have permission to send a message on this class.",
      };
    }

    const attachments = formData.getAll("attachments");
    const chatAttachments = Array.isArray(attachments)
      ? await Promise.all(
          attachments.map(async (attachment) => {
            if (
              attachment instanceof File &&
              attachment.name !== "undefined" &&
              attachment.size > 0
            ) {
              return await uploadAttachments(
                "messages",
                classroomId,
                attachment,
              );
            }
            return null;
          }),
        ).then((results) =>
          results.filter((url): url is string => url !== null),
        )
      : [];

    const newChat = {
      userId: session.user.id,
      userName: session.user.name,
      userImage: session.user.image as string,
      message: (formData.get("message") as string | null) || null,
      classId: classroomId,
      attachments: chatAttachments,
    };

    const result = createChatSchema.safeParse(newChat);
    if (result.error) {
      return {
        success: false,
        message: "Invalid message data provided.",
      };
    }

    const data = await addMessageToChatRecord(result.data);
    if (!data) return { success: false, message: "Failed to send message." };

    return { success: true, message: "Message sent!" };
  });

export const deleteAllMessagesByUserIdFn = createServerFn({
  method: "POST",
})
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const messages = await getAllMessagesByUserId(userId);
    if (!messages || !messages.length) {
      return { success: true, message: "No messages to delete." };
    }

    const attachments = messages.map((c) => c.attachments).flat();
    if (attachments.length) {
      const chatAttachmentsFilePath = attachments.map((file) =>
        extractMessagesFilePath(file),
      );
      await deleteFilesFromBucket("messages", chatAttachmentsFilePath);
    }

    await deleteAllMessagesByUserId(userId);
    return {
      success: true,
      message: "All user messages deleted successfully.",
    };
  });

export const deleteAllMessagesByClassIdFn = createServerFn({
  method: "POST",
})
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const messages = await getAllMessagesByClassId(classId);
    if (!messages || !messages.length) {
      return { success: true, message: "No messages to delete." };
    }

    const attachments = messages.map((c) => c.attachments).flat();
    if (attachments.length) {
      const chatAttachmentsFilePath = attachments.map((file) =>
        extractMessagesFilePath(file),
      );
      await deleteFilesFromBucket("messages", chatAttachmentsFilePath);
    }

    const deletedData = await deleteAllMessagesByClassIdRecord(classId);

    if (!deletedData.length) {
      return { success: false, message: "Failed to delete messages." };
    }

    return { success: true, message: "All messages deleted successfully." };
  });
