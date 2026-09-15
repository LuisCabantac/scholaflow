import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { extractCommentFilePath } from "@/lib/utils";
import { uploadAttachments } from "@/services/storage";
import { getClassStreamByStreamId } from "@/services/stream";
import { deleteFileFromBucket } from "@/services/user-management";
import {
  createStreamCommentSchema,
  createStreamPrivateCommentSchema,
} from "@/lib/schema";
import {
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/services/classroom";
import {
  sendNotification,
  deleteAllNotificationsByResourceId,
} from "@/services/notification";
import {
  createStreamComment,
  createPrivateComment,
  getAllCommentsByUserId,
  getAllCommentsByStreamId,
  deleteStreamCommentRecord,
  deletePrivateCommentRecord,
  getStreamCommentByCommentId,
  getAllPrivateCommentsByUserId,
  getAllPrivateCommentsByStreamId,
  getStreamPrivateCommentByCommentId,
} from "@/services/comment";

export const getAllCommentsByStreamIdFn = createServerFn({ method: "GET" })
  .validator((streamId: string) => streamId)
  .handler(async ({ data: streamId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllCommentsByStreamId(streamId);
  });

export const getAllCommentsByUserIdFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllCommentsByUserId(userId);
  });

export const getStreamCommentByCommentIdFn = createServerFn({ method: "GET" })
  .validator((commentId: string) => commentId)
  .handler(async ({ data: commentId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getStreamCommentByCommentId(commentId);
  });

export const getAllPrivateCommentsByStreamIdFn = createServerFn({
  method: "GET",
})
  .validator((streamId: string) => streamId)
  .handler(async ({ data: streamId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllPrivateCommentsByStreamId(streamId);
  });

export const getAllPrivateCommentsByUserIdFn = createServerFn({
  method: "GET",
})
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllPrivateCommentsByUserId(userId);
  });

export const getStreamPrivateCommentByCommentIdFn = createServerFn({
  method: "GET",
})
  .validator((commentId: string) => commentId)
  .handler(async ({ data: commentId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getStreamPrivateCommentByCommentId(commentId);
  });

export const addCommentToStreamFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const classroomId = formData.get("classroomId") as string;
    const streamId = formData.get("streamId") as string;

    const classroom = await getClassByClassId(classroomId);
    if (!classroom)
      return { success: false, message: "This class doesn't exist." };

    const enrolledClass = await getEnrolledClassByClassAndSessionId(
      session.user.id,
      classroomId,
    );

    if (!(
      classroom.teacherId === session.user.id ||
      enrolledClass ||
      classroom.allowUsersToComment
    )) {
      return {
        success: false,
        message: "You don't have permission to comment on this post.",
      };
    }

    const attachment = formData.get("attachment");
    const commentAttachment =
      attachment instanceof File &&
      attachment.name !== "undefined" &&
      attachment.size > 0
        ? await uploadAttachments("comments", classroomId, attachment)
        : null;

    const newComment = {
      streamId,
      classId: classroomId,
      userId: session.user.id,
      userName: session.user.name,
      userImage: session.user.image as string,
      content: (formData.get("comment") as string | null) || null,
      attachment: commentAttachment,
    };

    const result = createStreamCommentSchema.safeParse(newComment);
    if (result.error) {
      return {
        success: false,
        message: "Invalid comment data provided.",
      };
    }

    const data = await createStreamComment(result.data);
    if (!data) return { success: false, message: "Failed to save comment." };

    await sendNotification(
      "comment",
      classroom.teacherId,
      data.id,
      data.content ?? (data.attachment ? "Commented an image" : ""),
      `/classroom/class/${data.classId}/stream/${data.streamId}?comment=${data.id}`,
      session.user.name,
      session.user.image as string,
    );

    return { success: true, message: "Comment added successfully!" };
  });

export const deleteStreamCommentFn = createServerFn({ method: "POST" })
  .validator(
    (data: { classroomId: string; streamId: string; commentId: string }) =>
      data,
  )
  .handler(async ({ data: { classroomId, streamId, commentId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const classroom = await getClassByClassId(classroomId);
    if (!classroom)
      return { success: false, message: "This class doesn't exist." };

    const stream = await getClassStreamByStreamId(streamId);
    if (!stream)
      return {
        success: false,
        message: "This post doesn't exist in this class.",
      };

    const comment = await getStreamCommentByCommentId(commentId);
    if (!comment)
      return {
        success: false,
        message: "This comment doesn't exist on this post.",
      };

    if (!(
      comment.userId === session.user.id ||
      classroom.teacherId === session.user.id
    )) {
      return {
        success: false,
        message: "You're not authorized to delete this comment.",
      };
    }

    if (comment.attachment) {
      const filePath = extractCommentFilePath(comment.attachment);
      await deleteFileFromBucket("comments", filePath);
    }

    const data = await deleteStreamCommentRecord(commentId, streamId);

    if (data) {
      await deleteAllNotificationsByResourceId(data.id);
    }

    return { success: true, message: "Comment deleted successfully." };
  });

export const addPrivateCommentFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const classroomId = formData.get("classroomId") as string;
    const streamId = formData.get("streamId") as string;
    const userId = formData.get("userId") as string;

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
        message: "You don't have permission to comment.",
      };
    }

    const stream = await getClassStreamByStreamId(streamId);
    if (!stream)
      return { success: false, message: "This stream doesn't exist." };

    if (!(
      stream.announceToAll ||
      session.user.id === classroom.teacherId ||
      stream.announceTo.includes(session.user.id)
    )) {
      return {
        success: false,
        message: "You don't have permission to comment on this classwork.",
      };
    }

    const attachment = formData.get("attachment");
    const commentAttachment =
      attachment instanceof File &&
      attachment.name !== "undefined" &&
      attachment.size > 0
        ? await uploadAttachments("comments", classroomId, attachment)
        : null;

    const newPrivateComment = {
      streamId,
      classId: classroomId,
      userId: session.user.id,
      userName: session.user.name,
      userImage: session.user.image as string,
      content: (formData.get("comment") as string | null) || null,
      attachment: commentAttachment,
      toUserId:
        session.user.id === classroom.teacherId ? userId : classroom.teacherId,
    };

    const result =
      createStreamPrivateCommentSchema.safeParse(newPrivateComment);
    if (result.error) {
      return {
        success: false,
        message: "Invalid private comment data provided.",
      };
    }

    const data = await createPrivateComment(result.data);
    if (!data)
      return {
        success: false,
        message: "Failed to save private comment.",
      };

    await sendNotification(
      "comment",
      classroom.teacherId,
      data.id,
      data.content ?? (data.attachment ? "Commented an image" : ""),
      `/classroom/class/${data.classId}/stream/${data.streamId}/submissions?name=${data.userName.toLowerCase().replace(/\s+/g, "-")}&user=${data.userId}&comment=${data.id}`,
      session.user.name,
      session.user.image as string,
    );

    return { success: true, message: "Private comment added successfully!" };
  });

export const deletePrivateCommentFn = createServerFn({ method: "POST" })
  .validator(
    (data: { classroomId: string; streamId: string; commentId: string }) =>
      data,
  )
  .handler(async ({ data: { classroomId, streamId, commentId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const classroom = await getClassByClassId(classroomId);
    if (!classroom)
      return { success: false, message: "This class doesn't exist." };

    const stream = await getClassStreamByStreamId(streamId);
    if (!stream)
      return {
        success: false,
        message: "This post doesn't exist in this class.",
      };

    const comment = await getStreamPrivateCommentByCommentId(commentId);
    if (!comment)
      return {
        success: false,
        message: "This comment doesn't exist on this post.",
      };

    if (!(
      comment.userId === session.user.id ||
      classroom.teacherId === session.user.id
    )) {
      return {
        success: false,
        message: "You're not authorized to delete this comment.",
      };
    }

    if (comment.attachment) {
      const filePath = extractCommentFilePath(comment.attachment);
      await deleteFileFromBucket("comments", filePath);
    }

    const data = await deletePrivateCommentRecord(commentId, streamId);
    if (!data)
      return {
        success: false,
        message: "Failed to delete the private comment.",
      };

    await deleteAllNotificationsByResourceId(data.id);

    return {
      success: true,
      message: "Private comment deleted successfully.",
    };
  });
