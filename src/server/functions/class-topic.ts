import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import type { Outcome } from "@/types/api";
import { isClassMember } from "@/services/classroom";
import { getAllClassTopicsByClassId } from "@/services/class-topic";
import {
  createTopicFlow,
  deleteTopicFlow,
  renameTopicFlow,
} from "@/services/class-topic-flows";

function reply<T>(
  outcome: Outcome<T>,
  copy: { success: string; forbidden: string; not_found: string },
) {
  if (outcome.ok) return { success: true, message: copy.success };
  if (outcome.code === "forbidden") {
    return { success: false, message: copy.forbidden };
  }
  if (outcome.code === "not_found") {
    return { success: false, message: copy.not_found };
  }
  return { success: false, message: outcome.message };
}

export const getAllClassTopicsByClassIdFn = createServerFn({ method: "GET" })
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || !(await isClassMember(session.user.id, classId))) {
      return null;
    }

    return await getAllClassTopicsByClassId(classId);
  });

export const createTopicFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const classroomId = formData.get("classroomId") as string;
    const name = (formData.get("topicName") as string) || "";

    return reply(await createTopicFlow(session.user, classroomId, name), {
      success: "Topic created successfully!",
      forbidden: "Only the creator of this class can create topics.",
      not_found: "This class does not exist.",
    });
  });

export const updateTopicFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const topicId = formData.get("topicId") as string;
    const name = (formData.get("topicName") as string) || "";
    if (topicId === "no-topic") {
      return { success: false, message: "This topic doesn't exist." };
    }

    const outcome = await renameTopicFlow(session.user, topicId, name);
    if (outcome.ok && !outcome.value.changed) {
      return { success: true, message: "No changes were made to the topic." };
    }
    return reply(outcome, {
      success: "Topic updated successfully!",
      forbidden: "Only the creator of this class can edit topics.",
      not_found: "This topic doesn't exist.",
    });
  });

export const deleteTopicFn = createServerFn({ method: "POST" })
  .validator((topicId: string) => topicId)
  .handler(async ({ data: topicId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    return reply(await deleteTopicFlow(session.user, topicId), {
      success: "Topic deleted successfully.",
      forbidden: "Only the creator of this class can delete topics.",
      not_found: "This topic does not exist.",
    });
  });
