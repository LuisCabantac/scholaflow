import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import type { StreamType } from "@/lib/schema";
import { uploadAttachments } from "@/services/storage";
import { readStreamFormFields } from "@/lib/stream-form";
import { getClassTopicByTopicId } from "@/services/class-topic";
import { deleteFilesFromBucket } from "@/services/user-management";
import { createStreamSchema, editStreamSchema } from "@/lib/schema";
import {
  deleteAllNotificationsByResourceId,
  sendNotification,
} from "@/services/notification";
import {
  deleteAllClassworksByStreamIdRecord,
  getAllClassworksByStreamId,
} from "@/services/classwork";
import {
  getAllEnrolledClassesByClassId,
  getClassByClassId,
  isClassMember,
} from "@/services/classroom";
import {
  arraysAreEqual,
  extractClassworkFilePath,
  extractCommentFilePath,
  extractStreamFilePath,
  capitalizeFirstLetter,
} from "@/lib/utils";
import {
  deleteAllClassStreamCommentsByStreamIdRecord,
  deleteAllPrivateStreamCommentsByStreamIdRecord,
  getAllCommentsByStreamId,
  getAllPrivateCommentsByStreamId,
} from "@/services/comment";
import {
  createStreamPost,
  deleteClassStreamPost,
  getAllClassesStreamByUserId,
  getAllClassStreamsByClassId,
  getAllClassworkStreamsByClassId,
  getAllClassworkStreamsByTopicId,
  getAllEnrolledClassesClassworks,
  getClassStreamByStreamId,
  getClassworksByClassIdQuery,
  updateStreamPost,
} from "@/services/stream";

async function rosterUserIds(classId: string): Promise<string[]> {
  const enrolled = await getAllEnrolledClassesByClassId(classId);
  return enrolled?.map((entry) => entry.userId) ?? [];
}

export const getAllClassStreamsByClassIdFn = createServerFn({ method: "GET" })
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || !(await isClassMember(session.user.id, classId))) {
      return null;
    }

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

    const stream = await getClassStreamByStreamId(streamId);
    if (!stream || !(await isClassMember(session.user.id, stream.classId))) {
      return null;
    }

    return stream;
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

function streamLabel(type: StreamType, capitalized: boolean): string {
  const label = type === "stream" ? "post" : type;
  return capitalized ? capitalizeFirstLetter(label) : label;
}

export const createStreamFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const fields = readStreamFormFields(formData);
    const { classroomId, type: postType, topicId, isAssignToAll } = fields;

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

    const announceTo = isAssignToAll
      ? await rosterUserIds(classroomId)
      : fields.announceTo;

    const newStream = {
      type: postType,
      classId: classroomId,
      className: classroom.name,
      userId: session.user.id,
      userName: session.user.name,
      userImage: session.user.image as string,
      title: fields.title,
      content: fields.content,
      attachments: postAttachments,
      links: fields.links,
      points: fields.points,
      dueDate: fields.dueDate,
      topicId: topic ? topic.id : null,
      topicName: topic ? topic.name : null,
      announceToAll: isAssignToAll,
      announceTo,
      acceptingSubmissions: fields.acceptingSubmissions,
      closeSubmissionsAfterDueDate: fields.closeSubmissionsAfterDueDate,
      scheduledAt: fields.scheduledAt,
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
        announceTo,
        data.id,
        data.title ?? data.content ?? "",
        `/classroom/class/${data.classId}/stream/${data.id}`,
        session.user.name,
        session.user.image as string,
      );
    }

    return {
      success: true,
      message: `${streamLabel(postType, true)} published!`,
    };
  });

export const updateStreamFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const fields = readStreamFormFields(formData);
    const { classroomId, topicId } = fields;
    const streamId = fields.streamId ?? "";

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

    const newTitle = fields.title;
    const newContent = fields.content;
    const newAttachments = formData.getAll("attachments");
    const newUrlLinks = fields.links;
    const newPoints = fields.points;
    const newDueDate = fields.dueDate;
    const newScheduledAt = fields.scheduledAt;
    const newIsAssignToAll = fields.isAssignToAll;
    const curAttachments = fields.currentAttachments;
    const curUrlLinks = fields.currentLinks;
    const announceTo = newIsAssignToAll
      ? await rosterUserIds(currentStream.classId)
      : fields.announceTo;

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
      newScheduledAt?.getTime() !== currentStream.scheduledAt?.getTime() ||
      fields.acceptingSubmissions !== currentStream.acceptingSubmissions ||
      fields.closeSubmissionsAfterDueDate !==
        currentStream.closeSubmissionsAfterDueDate ||
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
        acceptingSubmissions: fields.acceptingSubmissions,
        closeSubmissionsAfterDueDate: fields.closeSubmissionsAfterDueDate,
        scheduledAt: newScheduledAt,
        updatedAt: new Date(),
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

      return {
        success: true,
        message: `${streamLabel(currentStream.type, true)} updated successfully!`,
      };
    }

    return {
      success: true,
      message: `No changes were made to the ${streamLabel(currentStream.type, false)}.`,
    };
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

    if (
      !(
        stream.userId === session.user.id ||
        classroom.teacherId === session.user.id
      )
    ) {
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
