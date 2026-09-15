import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { getUserByUserId } from "@/services/user";
import { createClassworkSchema } from "@/lib/schema";
import { uploadAttachments } from "@/services/storage";
import { getClassByClassId } from "@/services/classroom";
import { getClassStreamByStreamId } from "@/services/stream";
import { deleteFilesFromBucket } from "@/services/user-management";
import { arraysAreEqual, extractClassworkFilePath } from "@/lib/utils";
import {
  sendNotification,
  deleteAllNotificationsByResourceId,
} from "@/services/notification";
import {
  createClasswork,
  updateClassworkRecord,
  getAllClassworksByUserId,
  getAllClassworksByClassId,
  getAllClassworksByStreamId,
  getClassworkByStreamAndUserId,
  getAllClassworksByClassAndUserId,
  deleteAllClassworksByStreamIdRecord,
  deleteAllClassworksByClassAndUserIdRecord,
  getAllAssignedClassworksByStreamAndClassroomId,
} from "@/services/classwork";

export const getAllClassworksByClassIdFn = createServerFn({ method: "GET" })
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllClassworksByClassId(classId);
  });

export const getAllClassworksByStreamIdFn = createServerFn({ method: "GET" })
  .validator((streamId: string) => streamId)
  .handler(async ({ data: streamId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllClassworksByStreamId(streamId);
  });

export const getAllClassworksByUserIdFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllClassworksByUserId(userId);
  });

export const getAllClassworksByClassAndUserIdFn = createServerFn({
  method: "GET",
})
  .validator((data: { userId: string; classId: string }) => data)
  .handler(async ({ data: { userId, classId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const classroom = await getClassByClassId(classId);
    if (!classroom) return null;

    return await getAllClassworksByClassAndUserId(userId, classId);
  });

export const getClassworkByClassAndUserIdFn = createServerFn({ method: "GET" })
  .validator(
    (data: { userId: string; classId: string; streamId: string }) => data,
  )
  .handler(async ({ data: { userId, classId, streamId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const classroom = await getClassByClassId(classId);
    if (!classroom) return null;

    const stream = await getClassStreamByStreamId(streamId);
    if (!stream) return null;

    if (!(stream.announceToAll || stream.announceTo.includes(userId)))
      return null;

    return await getClassworkByStreamAndUserId(streamId, userId);
  });

export const getAllAssignedClassworksByStreamAndClassroomIdFn = createServerFn({
  method: "GET",
})
  .validator((data: { classId: string; streamId: string }) => data)
  .handler(async ({ data: { classId, streamId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const classroom = await getClassByClassId(classId);
    if (!classroom) return null;

    const stream = await getClassStreamByStreamId(streamId);
    if (!stream) return null;

    if (classroom.teacherId !== session.user.id) return null;

    return await getAllAssignedClassworksByStreamAndClassroomId(
      classId,
      streamId,
    );
  });

export const updateClassworkFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    if (session.user.role === "admin") {
      return {
        success: false,
        message: "Only the original author can edit this post.",
      };
    }

    const classroomId = formData.get("classroomId") as string;
    const streamId = formData.get("streamId") as string;
    const classworkId = formData.get("classworkId") as string;

    const currentClasswork = await getClassworkByStreamAndUserId(
      streamId,
      session.user.id,
    );

    if (!currentClasswork) {
      return {
        success: false,
        message: "This post doesn't exist in this class.",
      };
    }

    const newAttachments = formData.getAll("attachments");
    const newUrlLinks = (formData.getAll("links") as string[]) || [];
    const newIsTurnedIn = formData.get("isTurned") === "true";

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

    const hasChanges =
      newAttachments.length > 0 ||
      newUrlLinks.length > 0 ||
      newIsTurnedIn !== currentClasswork.isTurnedIn ||
      !arraysAreEqual(curAttachments, currentClasswork.attachments ?? []) ||
      !arraysAreEqual(curUrlLinks, currentClasswork.links ?? []);

    if (hasChanges) {
      const removedAttachments = (currentClasswork.attachments || []).filter(
        (attachment) => !curAttachments.includes(attachment),
      );

      if (removedAttachments.length) {
        const filePaths = removedAttachments.map(extractClassworkFilePath);
        await deleteFilesFromBucket("classworks", filePaths);
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

      const data = await updateClassworkRecord(classworkId, result.data);

      if (!data)
        return { success: false, message: "Failed to update classwork." };

      return { success: true, message: "Classwork updated successfully!" };
    }

    return { success: true, message: "No changes were made to the classwork." };
  });

export const submitClassworkFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role === "admin") {
      return { success: false, message: "Unauthorized or invalid role." };
    }

    const classId = formData.get("classroomId") as string;
    const streamId = formData.get("streamId") as string;

    const classroom = await getClassByClassId(classId);
    if (!classroom)
      return { success: false, message: "This class doesn't exist." };

    const stream = await getClassStreamByStreamId(streamId);
    if (!stream)
      return { success: false, message: "This stream does not exist." };

    if (!stream.announceToAll && !stream.announceTo.includes(session.user.id)) {
      return {
        success: false,
        message: "You can't submit to this assigned work.",
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
              return await uploadAttachments("classworks", classId, attachment);
            }
            return null;
          }),
        ).then((results) =>
          results.filter((url): url is string => url !== null),
        )
      : [];

    const newClasswork = {
      userId: session.user.id,
      userName: session.user.name,
      userImage: session.user.image as string,
      classId,
      className: classroom.name,
      streamCreatedAt: stream.createdAt,
      title: stream.title,
      streamId,
      attachments: postAttachments,
      links: (formData.getAll("links") as string[]) || [],
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

    const data = await createClasswork(result.data);
    if (!data)
      return { success: false, message: "Failed to submit classwork." };

    await sendNotification(
      "submit",
      classroom.teacherId,
      data.id,
      stream.title ?? stream.content ?? "",
      `/classroom/class/${data.classId}/stream/${data.streamId}/submissions?name=${data.userName.toLowerCase().replace(/\s+/g, "-")}&user=${data.userId}`,
      session.user.name,
      session.user.image as string,
    );

    return { success: true, message: "Classwork submitted!" };
  });

export const unsubmitClassworkFn = createServerFn({ method: "POST" })
  .validator(
    (data: { classworkId: string; classroomId: string; streamId: string }) =>
      data,
  )
  .handler(async ({ data: { classworkId, streamId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role === "admin") {
      return {
        success: false,
        message: "Only the original author can edit this post.",
      };
    }

    const currentClasswork = await getClassworkByStreamAndUserId(
      streamId,
      session.user.id,
    );
    if (!currentClasswork)
      return {
        success: false,
        message: "This post doesn't exist in this class.",
      };

    const data = await updateClassworkRecord(classworkId, {
      isTurnedIn: false,
    });
    if (!data)
      return { success: false, message: "Failed to unsubmit classwork." };

    return { success: true, message: "Your classwork has been unsubmitted." };
  });

export const createEmptyClassworkFn = createServerFn({ method: "POST" })
  .validator(
    (data: {
      userId: string;
      classId: string;
      streamId: string;
      userPoints?: number | null;
    }) => data,
  )
  .handler(async ({ data: { userId, classId, streamId, userPoints } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const classroom = await getClassByClassId(classId);
    if (!classroom || session.user?.id !== classroom.teacherId) return null;

    const stream = await getClassStreamByStreamId(streamId);
    if (!stream) return null;

    const user = await getUserByUserId(userId);
    if (!user) return null;

    const newClasswork = {
      userId,
      userName: user.name,
      userImage: user.image as string,
      classId,
      className: classroom.name,
      streamId,
      title: stream.title,
      attachments: [],
      links: [],
      points: userPoints ?? null,
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
    if (result.error) return null;

    const data = await createClasswork(result.data);
    return data;
  });

export const addGradeClassworkFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const userId = formData.get("userId") as string;
    const streamId = formData.get("streamId") as string;
    const classId = formData.get("classroomId") as string;
    const classworkId = formData.get("classworkId") as string;
    const userPoints = formData.get("userPoints")
      ? Number(formData.get("userPoints"))
      : null;

    const classroom = await getClassByClassId(classId);
    if (!classroom || session.user.id !== classroom.teacherId) {
      return {
        success: false,
        message: "Only teachers can grade classworks.",
      };
    }

    const stream = await getClassStreamByStreamId(streamId);
    if (
      !stream ||
      (!stream.announceToAll && !stream.announceTo.includes(userId))
    ) {
      return {
        success: false,
        message: "This classwork doesn't exist or user isn't assigned.",
      };
    }

    const currentClasswork = await getClassworkByStreamAndUserId(
      streamId,
      userId,
    );

    if (!currentClasswork) {
      const user = await getUserByUserId(userId);
      if (!user) return { success: false, message: "User not found." };

      const newClasswork = {
        userId: user.id,
        userName: user.name,
        userImage: user.image as string,
        classId,
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
        return { success: false, message: "Invalid grade data provided." };
      }

      const data = await createClasswork(result.data);
      if (!data)
        return { success: false, message: "Failed to create grade entry." };

      await sendNotification(
        "grade",
        data.userId,
        data.id,
        data.points !== null
          ? `Grade received: ${userPoints}${stream.points ? `/${stream.points}` : ""} points`
          : "Your work has been reviewed",
        `/classroom/class/${classId}/stream/${streamId}`,
        session.user.name,
        session.user.image as string,
      );

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

      const data = await updateClassworkRecord(
        classworkId || currentClasswork.id,
        {
          points: userPoints,
          isGraded: true,
        },
      );
      if (!data) return { success: false, message: "Failed to update grade." };

      await sendNotification(
        "grade",
        data.userId,
        data.id,
        data.points !== null
          ? `Grade received: ${userPoints}${stream.points ? `/${stream.points}` : ""} points`
          : "Your work has been reviewed",
        `/classroom/class/${classId}/stream/${streamId}`,
        session.user.name,
        session.user.image as string,
      );

      return { success: true, message: "Grade has been added to this user." };
    }

    return { success: true, message: "No changes were made to the classwork." };
  });

export const deleteAllClassworkByClassAndUserIdFn = createServerFn({
  method: "POST",
})
  .validator((data: { classId: string; userId: string }) => data)
  .handler(async ({ data: { classId, userId } }) => {
    const classworks = await getAllClassworksByClassAndUserId(userId, classId);
    if (!classworks || !classworks.length) return { success: true };

    const attachments = classworks.flatMap((cw) => cw.attachments || []);
    if (attachments.length) {
      const classworkAttachmentsFilePath = attachments.map((file) =>
        extractClassworkFilePath(file as string),
      );
      await deleteFilesFromBucket("classworks", classworkAttachmentsFilePath);
    }

    const data = await deleteAllClassworksByClassAndUserIdRecord(
      classId,
      userId,
    );
    if (data.length) {
      for (const cw of data) {
        await deleteAllNotificationsByResourceId(cw.id);
      }
    }
    return { success: true };
  });

export const deleteAllClassworkByStreamIdFn = createServerFn({ method: "POST" })
  .validator((streamId: string) => streamId)
  .handler(async ({ data: streamId }) => {
    const classworks = await getAllClassworksByStreamId(streamId);
    if (!classworks || !classworks.length) return { success: true };

    for (const cw of classworks) {
      await deleteAllNotificationsByResourceId(cw.id);
    }

    const attachments = classworks.flatMap((cw) => cw.attachments || []);
    if (attachments.length) {
      const classworkAttachmentsFilePath = attachments.map((file) =>
        extractClassworkFilePath(file as string),
      );
      await deleteFilesFromBucket("classworks", classworkAttachmentsFilePath);
    }

    const data = await deleteAllClassworksByStreamIdRecord(streamId);
    return { success: true, deleted: data.length };
  });
