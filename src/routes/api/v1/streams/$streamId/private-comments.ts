import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { parseParams } from "@/server/api/parse";
import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { streamForMember } from "@/server/authorize/stream";
import { handle, noContent, ok } from "@/server/api/respond";
import { visiblePrivateComments } from "@/server/authorize/comment";
import { getAllPrivateCommentsByStreamId } from "@/services/comment";
import { privateCommentResponse, streamIdParams } from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/streams/{streamId}/private-comments",
  summary:
    "Private comments on a post (all for the teacher, own threads for others)",
  auth: "bearer",
  params: streamIdParams,
  response: z.array(privateCommentResponse),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

export const Route = createFileRoute(
  "/api/v1/streams/$streamId/private-comments",
)({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      GET: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { streamId } = parseParams(params, streamIdParams);
        const { classroom } = fromOutcome(
          await streamForMember(user.id, streamId),
        );
        const comments =
          (await getAllPrivateCommentsByStreamId(streamId)) ?? [];
        return ok(
          visiblePrivateComments(comments, user.id, classroom.teacherId),
        );
      }),
    },
  },
});
