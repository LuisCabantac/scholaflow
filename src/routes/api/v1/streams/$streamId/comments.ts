import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { uploadableFiles } from "@/lib/attachments";
import { registerRoute } from "@/server/api/openapi";
import { addCommentFlow } from "@/services/comment-flows";
import { handle, noContent, ok } from "@/server/api/respond";
import { getAllCommentsByStreamId } from "@/services/comment";
import { streamForViewer, streamRef } from "@/server/authorize/stream";
import { parseForm, parseParams, readMultipart } from "@/server/api/parse";
import {
  commentForm,
  streamCommentResponse,
  streamIdParams,
} from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/streams/{streamId}/comments",
  summary: "Comments on a post the caller may see",
  auth: "bearer",
  params: streamIdParams,
  response: z.array(streamCommentResponse),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

registerRoute({
  method: "POST",
  path: "/streams/{streamId}/comments",
  summary:
    "Comment on a post (multipart: comment, attachment). Teacher, or an enrolled member when comments are allowed; the post must be visible to the caller. 4 MB per request.",
  auth: "bearer",
  status: 201,
  params: streamIdParams,
  request: commentForm,
  files: { attachment: "one" },
  response: streamCommentResponse,
  errors: [
    "unauthorized",
    "validation_failed",
    "payload_too_large",
    "forbidden",
    "not_found",
    "conflict",
  ],
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
      POST: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { streamId } = parseParams(params, streamIdParams);
        const form = await readMultipart(request);
        const input = parseForm(form, commentForm);
        const ref = fromOutcome(await streamRef(streamId));
        const comment = fromOutcome(
          await addCommentFlow(user, ref, {
            ...input,
            file: uploadableFiles(form.getAll("attachment"))[0] ?? null,
          }),
        );
        return ok(comment, 201);
      }),
    },
  },
});
