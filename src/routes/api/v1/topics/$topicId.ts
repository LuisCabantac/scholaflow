import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { ApiError, fromOutcome } from "@/server/api/errors";
import { parseJson, parseParams } from "@/server/api/parse";
import { handle, noContent, ok } from "@/server/api/respond";
import { getClassTopicByTopicId } from "@/services/class-topic";
import { classTopicResponse, topicBody, topicIdParams } from "@/lib/schema/api";
import { deleteTopicFlow, renameTopicFlow } from "@/services/class-topic-flows";

registerRoute({
  method: "PATCH",
  path: "/topics/{topicId}",
  summary: "Rename a topic (teacher only)",
  auth: "bearer",
  params: topicIdParams,
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

registerRoute({
  method: "DELETE",
  path: "/topics/{topicId}",
  summary: "Delete a topic and unlabel its posts (teacher only)",
  auth: "bearer",
  status: 204,
  params: topicIdParams,
  response: z.undefined(),
  errors: [
    "unauthorized",
    "validation_failed",
    "forbidden",
    "not_found",
    "conflict",
  ],
});

export const Route = createFileRoute("/api/v1/topics/$topicId")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      PATCH: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { topicId } = parseParams(params, topicIdParams);
        const { name } = await parseJson(request, topicBody);
        fromOutcome(await renameTopicFlow(user, topicId, name));
        const topic = await getClassTopicByTopicId(topicId);
        if (!topic) {
          throw new ApiError("not_found", "This topic doesn't exist.");
        }
        return ok(topic);
      }),
      DELETE: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { topicId } = parseParams(params, topicIdParams);
        fromOutcome(await deleteTopicFlow(user, topicId));
        return noContent();
      }),
    },
  },
});
