import type { Outcome } from "@/types/api";
import type { Actor } from "@/services/classroom-flows";
import { classroomForTeacher } from "@/server/authorize/classroom";
import { createClassTopicSchema, editClassTopicSchema } from "@/lib/schema";
import {
  getAllClassworkStreamsByTopicId,
  updateClassStreamPostTopic,
} from "@/services/stream";
import {
  createClassTopicRecord,
  deleteClassTopicRecord,
  getClassTopicByTopicId,
  updateClassTopicRecord,
} from "@/services/class-topic";

const topicMissing: Outcome<never> = {
  ok: false,
  code: "not_found",
  message: "This topic doesn't exist.",
};

const invalid: Outcome<never> = {
  ok: false,
  code: "validation_failed",
  message: "Invalid topic data provided.",
};

export async function createTopicFlow(
  user: Actor,
  classId: string,
  name: string,
): Promise<Outcome<{ id: string }>> {
  const classroom = await classroomForTeacher(user.id, classId);
  if (!classroom.ok) return classroom;

  const result = createClassTopicSchema.safeParse({ name, classId });
  if (result.error) return invalid;

  const topic = await createClassTopicRecord(result.data);
  if (!topic) {
    return { ok: false, code: "conflict", message: "Failed to create topic." };
  }
  return { ok: true, value: { id: topic.id } };
}

export async function renameTopicFlow(
  user: Actor,
  topicId: string,
  name: string,
): Promise<Outcome<{ changed: boolean }>> {
  const topic = await getClassTopicByTopicId(topicId);
  if (!topic) return topicMissing;

  const classroom = await classroomForTeacher(user.id, topic.classId);
  if (!classroom.ok) return classroom;
  if (name === topic.name) return { ok: true, value: { changed: false } };

  const result = editClassTopicSchema.safeParse({ name });
  if (result.error) return invalid;

  const streams = await getAllClassworkStreamsByTopicId(topic.id);
  for (const stream of streams ?? []) {
    await updateClassStreamPostTopic("edit", stream, name);
  }

  const updated = await updateClassTopicRecord(topic.id, result.data);
  if (!updated) {
    return { ok: false, code: "conflict", message: "Failed to update topic." };
  }
  return { ok: true, value: { changed: true } };
}

export async function deleteTopicFlow(
  user: Actor,
  topicId: string,
): Promise<Outcome<void>> {
  const topic = await getClassTopicByTopicId(topicId);
  if (!topic) return topicMissing;

  const classroom = await classroomForTeacher(user.id, topic.classId);
  if (!classroom.ok) return classroom;

  const streams = await getAllClassworkStreamsByTopicId(topicId);
  for (const stream of streams ?? []) {
    await updateClassStreamPostTopic("delete", stream);
  }

  const deleted = await deleteClassTopicRecord(topicId);
  if (!deleted) {
    return { ok: false, code: "conflict", message: "Failed to delete topic." };
  }
  return { ok: true, value: undefined };
}
