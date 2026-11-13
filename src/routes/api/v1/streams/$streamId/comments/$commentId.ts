import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { commentParams } from "@/lib/schema/api";
import { parseParams } from "@/server/api/parse";
import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { streamRef } from "@/server/authorize/stream";
import { handle, noContent } from "@/server/api/respond";
import { deleteCommentFlow } from "@/services/comment-flows";

registerRoute({
  method: "DELETE",
  path: "/streams/{streamId}/comments/{commentId}",
  summary: "Delete a comment (author or class teacher)",
  auth: "bearer",
  status: 204,
  params: commentParams,
  response: z.undefined(),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

export const Route = createFileRoute(
  "/api/v1/streams/$streamId/comments/$commentId",
)({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      DELETE: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { streamId, commentId } = parseParams(params, commentParams);
        const ref = fromOutcome(await streamRef(streamId));
        fromOutcome(await deleteCommentFlow(user, ref, commentId));
        return noContent();
      }),
    },
  },
});
