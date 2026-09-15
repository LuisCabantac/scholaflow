import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { getUserByEmail } from "@/services/user";
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
  getAllMessagesByClassId,
  deleteAllMessagesByClassIdRecord,
} from "@/services/message";
import {
  sendNotification,
  deleteAllNotificationsByResourceId,
} from "@/services/notification";
import {
  generateClassCode,
  extractStreamFilePath,
  extractCommentFilePath,
  extractMessagesFilePath,
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
  getAllClassworksByClassAndUserId,
  deleteAllClassworksByStreamIdRecord,
  deleteAllClassworksByClassAndUserIdRecord,
} from "@/services/classwork";
import {
  deleteClass,
  createClassroom,
  updateClassroom,
  getClassByClassId,
  getClassByClassCode,
  createEnrolledClass,
  updateEnrolledClass,
  getClassNameByClassId,
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
  getAllEnrolledClassesByClassId,
  getEnrolledClassByUserAndClassId,
  getEnrolledClassByClassAndUserId,
  getEnrolledClassByEnrolledClassId,
  deleteMultipleEnrolledClassRecord,
  getEnrolledClassByClassAndSessionId,
  getAllEnrolledClassesByClassAndSessionId,
  deleteEnrolledClassbyClassAndEnrolledClassId,
} from "@/services/classroom";

export const getAllClassesByTeacherIdFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllClassesByTeacherId(id);
  });

export const getClassNameByClassIdFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getClassNameByClassId(id);
  });

export const getClassByClassIdFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getClassByClassId(id);
  });

export const getClassByClassCodeFn = createServerFn({ method: "GET" })
  .validator((code: string) => code)
  .handler(async ({ data: code }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getClassByClassCode(code);
  });

export const getEnrolledClassByClassAndSessionIdFn = createServerFn({
  method: "GET",
})
  .validator((data: { userId: string; classId: string }) => data)
  .handler(async ({ data: { userId, classId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getEnrolledClassByClassAndSessionId(userId, classId);
  });

export const getEnrolledClassByEnrolledClassIdFn = createServerFn({
  method: "GET",
})
  .validator((enrolledClassId: string) => enrolledClassId)
  .handler(async ({ data: enrolledClassId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getEnrolledClassByEnrolledClassId(enrolledClassId);
  });

export const getAllEnrolledClassesByClassAndSessionIdFn = createServerFn({
  method: "GET",
})
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllEnrolledClassesByClassAndSessionId(classId);
  });

export const getEnrolledClassByClassAndUserIdFn = createServerFn({
  method: "GET",
})
  .validator((data: { userId: string; classId: string }) => data)
  .handler(async ({ data: { userId, classId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getEnrolledClassByClassAndUserId(userId, classId);
  });

export const getAllEnrolledClassesByUserIdFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllEnrolledClassesByUserId(userId);
  });

export const getAllEnrolledClassesByClassIdFn = createServerFn({
  method: "GET",
})
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllEnrolledClassesByClassId(classId);
  });

export const getEnrolledClassByUserAndClassIdFn = createServerFn({
  method: "GET",
})
  .validator((data: { userId: string; classId: string }) => data)
  .handler(async ({ data: { userId, classId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getEnrolledClassByUserAndClassId(userId, classId);
  });

export const createClassFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session)
      return { success: false, message: "Unauthorized", classUrl: "" };

    const newClass = {
      name: (formData.get("className") as string) || "",
      subject: (formData.get("subject") as string | null) || null,
      section: (formData.get("section") as string) || "",
      room: (formData.get("room") as string | null) || null,
      cardBackground: (formData.get("color") as string) || "",
      illustrationIndex: Math.floor(Math.random() * 5),
      code: generateClassCode(),
      teacherId: session.user.id,
      teacherName: session.user.name,
      teacherImage: session.user.image as string,
    };

    const result = createClassroomSchema.safeParse(newClass);
    if (result.error) {
      return {
        success: false,
        message: "Invalid class information provided.",
        classUrl: "",
      };
    }

    const data = await createClassroom({
      ...result.data,
      description: null,
      allowUsersToComment: false,
      allowUsersToPost: false,
    });

    if (!data)
      return {
        success: false,
        message: "Failed to create class",
        classUrl: "",
      };

    return {
      success: true,
      message: "Class created successfully!",
      classUrl: `/classroom/class/${data.id}`,
    };
  });

export const updateClassFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session)
      return { success: false, message: "Unauthorized", classUrl: "" };

    const classroomId = formData.get("classroomId") as string;
    const updateClassCode = formData.get("updateClassCode") === "true";

    const currentClassroom = await getClassByClassId(classroomId);
    if (!currentClassroom)
      return {
        success: false,
        message: "This class doesn't exist.",
        classUrl: "",
      };
    if (session.user.id !== currentClassroom.teacherId)
      return {
        success: false,
        message: "Only the creator can edit this.",
        classUrl: "",
      };

    const newClassName = formData.get("className") as string;
    const newSubject = formData.get("subject") as string;
    const newSection = formData.get("section") as string | null;
    const newClassDescription = formData.get("classDescription") as
      string | null;
    const newAllowStudentsToComment =
      formData.get("allowStudentsToComment") === "true";
    const newClassCardBackgroundColor = formData.get("color") as string;
    const newAllowStudentsToPost =
      formData.get("allowStudentsToPost") === "true";

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
            name: newClassName,
            subject: newSubject,
            section: newSection ?? "",
            cardBackground: newClassCardBackgroundColor,
          });
        }
      }

      await updateClassroom(classroomId, updatedClass);

      return {
        success: true,
        message: "Class updated successfully!",
        classUrl: `/classroom/class/${classroomId}`,
      };
    }

    return {
      success: true,
      message: "No changes were made to the class.",
      classUrl: "",
    };
  });

export const joinClassFn = createServerFn({ method: "POST" })
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    if (session.user.role === "admin") {
      return {
        success: false,
        message: "Only teachers and students can join classes.",
      };
    }

    const classroom = await getClassByClassId(classId);

    if (!classroom)
      return { success: false, message: "This class doesn't exist" };

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
        message: "Invalid enrollment data.",
      };
    }

    const data = await createEnrolledClass(result.data);

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
      session.user.name,
      session.user.image as string,
    );

    return { success: true, message: "You've successfully joined the class!" };
  });

export const deleteMultipleEnrolledClassFn = createServerFn({ method: "POST" })
  .validator((classIds: string[]) => classIds)
  .handler(async ({ data: classIds }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role !== "admin") return { success: false };

    for (const id of classIds) {
      await deleteAllNotificationsByResourceId(id);
    }

    await deleteMultipleEnrolledClassRecord(classIds);
    return { success: true };
  });

export const deleteEnrolledClassbyClassAndEnrolledClassIdFn = createServerFn({
  method: "POST",
})
  .validator((data: { enrolledClassId: string; classId: string }) => data)
  .handler(async ({ data: { enrolledClassId, classId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const currentEnrolledClass =
      await getEnrolledClassByEnrolledClassId(enrolledClassId);
    if (!currentEnrolledClass)
      return {
        success: false,
        message: "You are not a member of this class.",
      };

    const classroom = await getClassByClassId(classId);
    if (!classroom)
      return { success: false, message: "This class doesn't exist." };

    if (!(
      classroom.teacherId === session.user.id ||
      currentEnrolledClass.userId === session.user.id
    )) {
      return {
        success: false,
        message: "You're not authorized to remove this user.",
      };
    }

    const classworks = await getAllClassworksByClassAndUserId(
      currentEnrolledClass.userId,
      currentEnrolledClass.classId,
    );

    if (classworks?.length) {
      const attachments = classworks.flatMap((cw) => cw.attachments || []);
      if (attachments.length) {
        const classworkAttachmentsFilePath = attachments.map((file) =>
          extractClassworkFilePath(file as string),
        );
        await deleteFilesFromBucket("classworks", classworkAttachmentsFilePath);
      }
      for (const cw of classworks) {
        await deleteAllNotificationsByResourceId(cw.id);
      }
      await deleteAllClassworksByClassAndUserIdRecord(
        currentEnrolledClass.classId,
        currentEnrolledClass.userId,
      );
    }

    const data = await deleteEnrolledClassbyClassAndEnrolledClassId(
      enrolledClassId,
      classId,
    );

    if (data) {
      await deleteAllNotificationsByResourceId(data.id);
    }

    return { success: true, message: "Member removed from class." };
  });

export const deleteClassFn = createServerFn({ method: "POST" })
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const currentClassroom = await getClassByClassId(classId);
    if (!currentClassroom)
      return { success: false, message: "This class doesn't exist." };

    if (currentClassroom.teacherId === session.user.id) {
      const classes = await getAllEnrolledClassesByClassId(classId);
      if (classes?.length) {
        const enrolledIds = classes.map((curClass) => curClass.id);
        for (const rowId of enrolledIds) {
          await deleteAllNotificationsByResourceId(rowId);
        }
        await deleteMultipleEnrolledClassRecord(enrolledIds);
      }

      const messages = await getAllMessagesByClassId(classId);
      if (messages?.length) {
        const attachments = messages.flatMap((chat) => chat.attachments || []);
        if (attachments.length) {
          const chatAttachmentsFilePath = attachments.map((file) =>
            extractMessagesFilePath(file as string),
          );
          await deleteFilesFromBucket("messages", chatAttachmentsFilePath);
        }
        await deleteAllMessagesByClassIdRecord(classId);
      }

      const streams = await getAllClassStreamsByClassId(classId);
      if (streams?.length) {
        for (const str of streams) {
          const comments = await getAllCommentsByStreamId(str.id);
          if (comments?.length) {
            const commentAttachments = comments
              .map((c) => c.attachment)
              .filter(Boolean) as string[];
            if (commentAttachments.length) {
              const commentFiles = commentAttachments.map(
                extractCommentFilePath,
              );
              await deleteFilesFromBucket("comments", commentFiles);
            }
            for (const c of comments) {
              await deleteAllNotificationsByResourceId(c.id);
            }
            await deleteAllClassStreamCommentsByStreamIdRecord(str.id);
          }

          const privateComments = await getAllPrivateCommentsByStreamId(str.id);
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
            await deleteAllPrivateStreamCommentsByStreamIdRecord(str.id);
          }

          const classworks = await getAllClassworksByStreamId(str.id);
          if (classworks?.length) {
            const cwAttachments = classworks.flatMap(
              (cw) => cw.attachments || [],
            );
            if (cwAttachments.length) {
              const cwFiles = cwAttachments.map((file) =>
                extractClassworkFilePath(file as string),
              );
              await deleteFilesFromBucket("classworks", cwFiles);
            }
            for (const cw of classworks) {
              await deleteAllNotificationsByResourceId(cw.id);
            }
            await deleteAllClassworksByStreamIdRecord(str.id);
          }

          if (str.attachments?.length) {
            const streamFiles = str.attachments.map((file) =>
              extractStreamFilePath(file as string),
            );
            await deleteFilesFromBucket("streams", streamFiles);
          }

          await deleteAllNotificationsByResourceId(str.id);

          await deleteClassStreamPost(str.id);
        }
      }

      const topics = await getAllClassTopicsByClassId(classId);
      if (topics?.length) {
        for (const topic of topics) {
          await deleteClassTopicRecord(topic.id);
        }
      }

      await deleteClass(classId);

      return { success: true, message: "Class deleted successfully." };
    }

    const currentEnrolledClass = await getEnrolledClassByClassAndSessionId(
      session.user.id,
      classId,
    );

    if (!currentEnrolledClass) {
      return {
        success: false,
        message: "You are not enrolled in this class.",
      };
    }

    const classworks = await getAllClassworksByClassAndUserId(
      session.user.id,
      classId,
    );

    if (classworks?.length) {
      const attachments = classworks.flatMap((cw) => cw.attachments || []);
      if (attachments.length) {
        const classworkAttachmentsFilePath = attachments.map((file) =>
          extractClassworkFilePath(file as string),
        );
        await deleteFilesFromBucket("classworks", classworkAttachmentsFilePath);
      }
      for (const cw of classworks) {
        await deleteAllNotificationsByResourceId(cw.id);
      }
      await deleteAllClassworksByClassAndUserIdRecord(classId, session.user.id);
    }

    const data = await deleteEnrolledClassbyClassAndEnrolledClassId(
      currentEnrolledClass.id,
      classId,
    );

    if (data) {
      await deleteAllNotificationsByResourceId(data.id);
    }

    return {
      success: true,
      message: "You've successfully left the class.",
    };
  });

export const addUserToClassFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

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
      return { success: false, message: "This class doesn't exist." };

    if (session.user.id !== classroom.teacherId) {
      return {
        success: false,
        message: "Only the creator of this class can add users.",
      };
    }

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

    if (user.role === "admin") {
      return {
        success: false,
        message: "This class can only include students and teachers.",
      };
    }

    const currentEnrolledClass = await getEnrolledClassByUserAndClassId(
      user.id,
      classroomId,
    );

    if (currentEnrolledClass)
      return {
        success: false,
        message: "This user is already a member of this class.",
      };

    const newEnrolledClass = {
      classId: classroom.id,
      userId: user.id,
      userName: user.name,
      userImage: user.image as string,
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
        message: "Invalid user data provided.",
      };
    }

    const data = await createEnrolledClass(result.data);

    if (!data)
      return { success: false, message: "Failed to add user to class." };

    await sendNotification(
      "addToClass" as any,
      data.userId,
      data.id,
      data.name,
      `/classroom/class/${data.classId}`,
      session.user.name,
      session.user.image as string,
    );

    return { success: true, message: "User successfully added to class!" };
  });
