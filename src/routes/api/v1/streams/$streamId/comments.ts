import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { parseParams } from "@/server/api/parse";
import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { streamForViewer } from "@/server/authorize/stream";
import { handle, noContent, ok } from "@/server/api/respond";
import { getAllCommentsByStreamId } from "@/services/comment";
import { streamCommentResponse, streamIdParams } from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/streams/{streamId}/comments",
  summary: "Comments on a post the caller may see",
  auth: "bearer",
  params: streamIdParams,
  response: z.array(streamCommentResponse),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

export const Route = createFileRoute("/api/v1/streams/$streamId/comments")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      GET: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { streamId } = parseParams(params, streamIdParams);
        fromOutcome(await streamForViewer(user.id, streamId));
        return ok((await getAllCommentsByStreamId(streamId)) ?? []);
      }),
    },
  },
});
