import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { uploadAttachments } from "@/services/storage";
import { getClassByClassId } from "@/services/classroom";
import { getClassTopicByTopicId } from "@/services/class-topic";
import { deleteFilesFromBucket } from "@/services/user-management";
import { createStreamSchema, editStreamSchema } from "@/lib/schema";
import {
  sendNotification,
  deleteAllNotificationsByResourceId,
} from "@/services/notification";
import {
  arraysAreEqual,
  extractStreamFilePath,
  extractCommentFilePath,
  extractClassworkFilePath,
} from "@/lib/utils";
import {
  getAllCommentsByStreamId,
  getAllPrivateCommentsByStreamId,
  deleteAllClassStreamCommentsByStreamIdRecord,
  deleteAllPrivateStreamCommentsByStreamIdRecord,
} from "@/services/comment";
import {
  getAllClassworksByStreamId,
  deleteAllClassworksByStreamIdRecord,
} from "@/services/classwork";
import {
  createStreamPost,
  updateStreamPost,
  deleteClassStreamPost,
  getClassStreamByStreamId,
  getAllClassesStreamByUserId,
  getAllClassStreamsByClassId,
  getClassworksByClassIdQuery,
  getAllClassworkStreamsByTopicId,
  getAllClassworkStreamsByClassId,
  getAllEnrolledClassesClassworks,
} from "@/services/stream";

export const getAllClassStreamsByClassIdFn = createServerFn({ method: "GET" })
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllClassStreamsByClassId(classId);
  });

export const getAllClassesStreamByUserIdFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllClassesStreamByUserId(userId);
  });

export const getClassStreamByStreamIdFn = createServerFn({ method: "GET" })
  .validator((streamId: string) => streamId)
  .handler(async ({ data: streamId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getClassStreamByStreamId(streamId);
  });

export const getAllClassworkStreamsByClassIdFn = createServerFn({
  method: "GET",
})
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllClassworkStreamsByClassId(classId);
  });

export const getAllClassworkStreamsByTopicIdFn = createServerFn({
  method: "GET",
})
  .validator((topicId: string) => topicId)
  .handler(async ({ data: topicId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllClassworkStreamsByTopicId(topicId);
  });

export const getAllEnrolledClassesClassworksFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session) return null;

  return await getAllEnrolledClassesClassworks(session.user.id);
});

export const getClassworksByClassIdQueryFn = createServerFn({ method: "GET" })
  .validator((data: { classId: string; query: string }) => data)
  .handler(async ({ data: { classId, query } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getClassworksByClassIdQuery(classId, query);
  });

export const createStreamFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const classroomId = formData.get("classroomId") as string;
    const postType = formData.get("type") as
      "stream" | "assignment" | "quiz" | "question" | "material";

    const isAssignToAll = formData.get("isAssignToAll") === "true";
    const topicId = (formData.get("topicId") as string) || "no-topic";
    const dueDate = formData.get("dueDate") as string | null;

    const classroom = await getClassByClassId(classroomId);
    if (!classroom)
      return { success: false, message: "This class doesn't exist." };

    if (session.user.role === "admin") {
      return {
        success: false,
        message: "You can't create a post on this class.",
      };
    }

    if (postType !== "stream" && classroom.teacherId !== session.user.id) {
      return {
        success: false,
        message: "Only teachers can create this type of stream post.",
      };
    }

    const attachments = formData.getAll("attachments");
    const postAttachments = Array.isArray(attachments)
      ? await Promise.all(
          attachments.map(async (attachment) => {
            if (
              attachment instanceof File &&
              attachment.name !== "undefined" &&
              attachment.size > 0
            ) {
              return await uploadAttachments(
                "streams",
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

    let topic = null;
    if (topicId !== "no-topic") {
      topic = await getClassTopicByTopicId(topicId);
    }

    let announceTo: string[] = [];
    if (!isAssignToAll) {
      const announceToData = formData.getAll("announceTo") as string[];
      if (announceToData.length === 1 && announceToData[0].startsWith("[")) {
        try {
          announceTo = JSON.parse(announceToData[0]);
        } catch {
          announceTo = [];
        }
      } else {
        announceTo = announceToData;
      }
    }

    const newStream = {
      type: postType || "stream",
      classId: classroomId,
      userId: session.user.id,
      userName: session.user.name,
      userImage: session.user.image as string,
      title: (formData.get("title") as string | null) || null,
      content: (formData.get("description") as string | null) || null,
      attachments: postAttachments,
      links: (formData.getAll("links") as string[]) || [],
      points: formData.get("points") ? Number(formData.get("points")) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      topicId: topic ? topic.id : null,
      topicName: topic ? topic.name : null,
      announceToAll: isAssignToAll,
      announceTo,
      acceptingSubmissions: true,
      closeSubmissionsAfterDueDate: false,
      scheduledAt: null,
    };

    const result = createStreamSchema.safeParse(newStream);
    if (result.error) {
      return {
        success: false,
        message:
          "Invalid post information provided. Please check all fields and try again.",
      };
    }

    const data = await createStreamPost(result.data);
    if (!data) return { success: false, message: "Failed to create post." };

    if (classroom.teacherId === session.user.id) {
      await sendNotification(
        data.type,
        data.classId,
        data.id,
        data.title ?? data.content ?? "",
        `/classroom/class/${data.classId}/stream/${data.id}`,
        session.user.name,
        session.user.image as string,
      );
    }

    return {
      success: true,
      message:
        postType === "stream" ? "Announcement posted!" : "Work assigned!",
    };
  });

export const updateStreamFn = createServerFn({ method: "POST" })
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

    const currentStream = await getClassStreamByStreamId(streamId);
    if (!currentStream)
      return {
        success: false,
        message: "This post doesn't exist in this class.",
      };

    if (currentStream.userId !== session.user.id) {
      return {
        success: false,
        message: "Only the original author can edit this post.",
      };
    }

    const newTitle = (formData.get("title") as string | null) || null;
    const newContent = (formData.get("description") as string | null) || null;
    const newAttachments = formData.getAll("attachments");
    const newUrlLinks = (formData.getAll("links") as string[]) || [];
    const newPoints = formData.get("points")
      ? Number(formData.get("points"))
      : null;
    const newDueDate = formData.get("dueDate")
      ? new Date(formData.get("dueDate") as string)
      : null;
    const newIsAssignToAll = formData.get("isAssignToAll") === "true";
    const topicId = (formData.get("topicId") as string) || "no-topic";

    let curAttachments = formData.getAll("curAttachments") as string[];
    if (curAttachments.length === 1 && curAttachments[0].startsWith("[")) {
      try {
        curAttachments = JSON.parse(curAttachments[0]);
      } catch {
        curAttachments = [];
      }
    }

    let curUrlLinks = formData.getAll("curUrlLinks") as string[];
    if (curUrlLinks.length === 1 && curUrlLinks[0].startsWith("[")) {
      try {
        curUrlLinks = JSON.parse(curUrlLinks[0]);
      } catch {
        curUrlLinks = [];
      }
    }

    let announceTo: string[] = [];
    if (!newIsAssignToAll) {
      const announceToData = formData.getAll("announceTo") as string[];
      if (announceToData.length === 1 && announceToData[0].startsWith("[")) {
        try {
          announceTo = JSON.parse(announceToData[0]);
        } catch {
          announceTo = [];
        }
      } else {
        announceTo = announceToData;
      }
    }

    let topic = null;
    if (topicId !== "no-topic") {
      topic = await getClassTopicByTopicId(topicId);
    }

    const hasChanges =
      newTitle !== currentStream.title ||
      newContent !== currentStream.content ||
      newPoints !== currentStream.points ||
      newDueDate?.getTime() !== currentStream.dueDate?.getTime() ||
      topicId !== (currentStream.topicId || "no-topic") ||
      newIsAssignToAll !== currentStream.announceToAll ||
      newAttachments.length > 0 ||
      newUrlLinks.length > 0 ||
      !arraysAreEqual(curAttachments, currentStream.attachments ?? []) ||
      !arraysAreEqual(curUrlLinks, currentStream.links ?? []) ||
      !arraysAreEqual(announceTo, currentStream.announceTo ?? []);

    if (hasChanges) {
      const removedAttachments = (currentStream.attachments || []).filter(
        (attachment) => !curAttachments.includes(attachment),
      );

      if (removedAttachments.length) {
        const filePaths = removedAttachments.map((file) =>
          extractStreamFilePath(file),
        );
        await deleteFilesFromBucket("streams", filePaths);
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

      const updatedStream = {
        title: newTitle,
        content: newContent,
        attachments: postAttachments.concat(curAttachments),
        links: newUrlLinks.concat(curUrlLinks),
        points: newPoints,
        dueDate: newDueDate,
        topicId: topic ? topic.id : null,
        topicName: topic ? topic.name : null,
        announceToAll: newIsAssignToAll,
        announceTo,
        acceptingSubmissions: currentStream.acceptingSubmissions,
        closeSubmissionsAfterDueDate:
          currentStream.closeSubmissionsAfterDueDate,
        scheduledAt: currentStream.scheduledAt,
      };

      const result = editStreamSchema.safeParse(updatedStream);
      if (result.error) {
        return {
          success: false,
          message:
            "Invalid update data provided. Please check all fields and try again.",
        };
      }

      const data = await updateStreamPost(streamId, result.data);

      if (!data) return { success: false, message: "Failed to update post." };

      return { success: true, message: "Post updated successfully!" };
    }

    return { success: true, message: "No changes were made to the post." };
  });

export const deleteClassStreamFn = createServerFn({ method: "POST" })
  .validator((data: { classroomId: string; streamId: string }) => data)
  .handler(async ({ data: { classroomId, streamId } }) => {
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

    if (!(
      stream.userId === session.user.id ||
      classroom.teacherId === session.user.id
    )) {
      return {
        success: false,
        message: "You're not authorized to delete this post.",
      };
    }

    const comments = await getAllCommentsByStreamId(streamId);
    if (comments?.length) {
      const commentAttachments = comments
        .map((c) => c.attachment)
        .filter(Boolean) as string[];
      if (commentAttachments.length) {
        const commentFiles = commentAttachments.map(extractCommentFilePath);
        await deleteFilesFromBucket("comments", commentFiles);
      }
      for (const c of comments) {
        await deleteAllNotificationsByResourceId(c.id);
      }
      await deleteAllClassStreamCommentsByStreamIdRecord(streamId);
    }

    const privateComments = await getAllPrivateCommentsByStreamId(streamId);
    if (privateComments?.length) {
      const privAttachments = privateComments
        .map((c) => c.attachment)
        .filter(Boolean) as string[];
      if (privAttachments.length) {
        const privFiles = privAttachments.map(extractCommentFilePath);
        await deleteFilesFromBucket("comments", privFiles);
      }
      for (const c of privateComments) {
        await deleteAllNotificationsByResourceId(c.id);
      }
      await deleteAllPrivateStreamCommentsByStreamIdRecord(streamId);
    }

    const classworks = await getAllClassworksByStreamId(streamId);
    if (classworks?.length) {
      const cwAttachments = classworks.flatMap((cw) => cw.attachments || []);
      if (cwAttachments.length) {
        const cwFiles = cwAttachments.map((file) =>
          extractClassworkFilePath(file as string),
        );
        await deleteFilesFromBucket("classworks", cwFiles);
      }
      for (const cw of classworks) {
        await deleteAllNotificationsByResourceId(cw.id);
      }
      await deleteAllClassworksByStreamIdRecord(streamId);
    }

    if (stream.attachments?.length) {
      const streamFiles = stream.attachments.map((file) =>
        extractStreamFilePath(file as string),
      );
      await deleteFilesFromBucket("streams", streamFiles);
    }

    await deleteAllNotificationsByResourceId(streamId);

    await deleteClassStreamPost(streamId);

    return { success: true, message: "Post deleted successfully." };
  });
