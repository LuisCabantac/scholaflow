import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { getClassByClassId } from "@/services/classroom";
import { createClassTopicSchema, editClassTopicSchema } from "@/lib/schema";
import {
  updateClassStreamPostTopic,
  getAllClassworkStreamsByTopicId,
} from "@/services/stream";
import {
  getClassTopicByTopicId,
  createClassTopicRecord,
  updateClassTopicRecord,
  deleteClassTopicRecord,
  getAllClassTopicsByClassId,
} from "@/services/class-topic";

export const getClassTopicByTopicIdFn = createServerFn({ method: "GET" })
  .validator((topicId: string) => topicId)
  .handler(async ({ data: topicId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) return null;
    return await getClassTopicByTopicId(topicId);
  });

export const getAllClassTopicsByClassIdFn = createServerFn({ method: "GET" })
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) return null;
    return await getAllClassTopicsByClassId(classId);
  });

export const createTopicFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const classroomId = formData.get("classroomId") as string;
    const classroom = await getClassByClassId(classroomId);

    if (!classroom)
      return { success: false, message: "This class does not exist." };
    if (session.user.id !== classroom.teacherId) {
      return {
        success: false,
        message: "Only the creator of this class can create topics.",
      };
    }

    const newTopic = {
      name: (formData.get("topicName") as string) || "",
      classId: classroomId,
    };

    const result = createClassTopicSchema.safeParse(newTopic);
    if (result.error) {
      return {
        success: false,
        message: "Invalid topic data provided.",
      };
    }

    const data = await createClassTopicRecord(result.data);
    if (!data) return { success: false, message: "Failed to create topic." };

    return { success: true, message: "Topic created successfully!" };
  });

export const updateTopicFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const classroomId = formData.get("classroomId") as string;
    const classroom = await getClassByClassId(classroomId);

    if (!classroom)
      return { success: false, message: "This class does not exist." };
    if (session.user.id !== classroom.teacherId) {
      return {
        success: false,
        message: "Only the creator of this class can edit topics.",
      };
    }

    const topicId = formData.get("topicId") as string;
    const currentTopic =
      topicId !== "no-topic" ? await getClassTopicByTopicId(topicId) : null;

    if (!currentTopic)
      return { success: false, message: "This topic doesn't exist." };

    const newTopicName = (formData.get("topicName") as string) || "";

    if (newTopicName !== currentTopic.name) {
      const result = editClassTopicSchema.safeParse({ name: newTopicName });
      if (result.error) {
        return {
          success: false,
          message: "Invalid topic data provided.",
        };
      }

      const classworkStream = await getAllClassworkStreamsByTopicId(
        currentTopic.id,
      );

      if (classworkStream?.length) {
        for (const stream of classworkStream) {
          await updateClassStreamPostTopic("edit", stream, newTopicName);
        }
      }

      const data = await updateClassTopicRecord(currentTopic.id, result.data);
      if (!data) return { success: false, message: "Failed to update topic." };

      return { success: true, message: "Topic updated successfully!" };
    }

    return { success: true, message: "No changes were made to the topic." };
  });

export const deleteTopicFn = createServerFn({ method: "POST" })
  .validator((topicId: string) => topicId)
  .handler(async ({ data: topicId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const topic = await getClassTopicByTopicId(topicId);
    if (!topic)
      return { success: false, message: "This topic does not exist." };

    const classroom = await getClassByClassId(topic.classId);
    if (!classroom)
      return { success: false, message: "This class does not exist." };

    if (session.user.id !== classroom.teacherId) {
      return {
        success: false,
        message: "Only the creator of this class can delete topics.",
      };
    }

    const classworkStream = await getAllClassworkStreamsByTopicId(topicId);

    if (classworkStream?.length) {
      for (const stream of classworkStream) {
        await updateClassStreamPostTopic("delete", stream);
      }
    }

    const data = await deleteClassTopicRecord(topicId);
    if (!data) return { success: false, message: "Failed to delete topic." };

    return { success: true, message: "Topic deleted successfully." };
  });
