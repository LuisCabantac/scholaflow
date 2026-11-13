import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { ApiError, fromOutcome } from "@/server/api/errors";
import { parseJson, parseParams } from "@/server/api/parse";
import { handle, noContent, ok } from "@/server/api/respond";
import { createTopicFlow } from "@/services/class-topic-flows";
import { classroomForMember } from "@/server/authorize/classroom";
import { classIdParams, classTopicResponse, topicBody } from "@/lib/schema/api";
import {
  getAllClassTopicsByClassId,
  getClassTopicByTopicId,
} from "@/services/class-topic";

registerRoute({
  method: "GET",
  path: "/classrooms/{classId}/topics",
  summary: "Topics of a class",
  auth: "bearer",
  params: classIdParams,
  response: z.array(classTopicResponse),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

registerRoute({
  method: "POST",
  path: "/classrooms/{classId}/topics",
  summary: "Create a topic (teacher only)",
  auth: "bearer",
  status: 201,
  params: classIdParams,
  request: topicBody,
  response: classTopicResponse,
  errors: [
    "unauthorized",
    "validation_failed",
    "forbidden",
    "not_found",
    "conflict",
  ],
});

export const Route = createFileRoute("/api/v1/classrooms/$classId/topics")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      GET: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        fromOutcome(await classroomForMember(user.id, classId));
        return ok((await getAllClassTopicsByClassId(classId)) ?? []);
      }),
      POST: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        const { name } = await parseJson(request, topicBody);
        const { id } = fromOutcome(await createTopicFlow(user, classId, name));
        const topic = await getClassTopicByTopicId(id);
        if (!topic) {
          throw new ApiError("not_found", "This topic doesn't exist.");
        }
        return ok(topic, 201);
      }),
    },
  },
});
