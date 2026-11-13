import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { uploadableFiles } from "@/lib/attachments";
import { registerRoute } from "@/server/api/openapi";
import { handle, noContent, ok } from "@/server/api/respond";
import { addPrivateCommentFlow } from "@/services/comment-flows";
import { visiblePrivateComments } from "@/server/authorize/comment";
import { getAllPrivateCommentsByStreamId } from "@/services/comment";
import { streamForViewer, streamRef } from "@/server/authorize/stream";
import { parseForm, parseParams, readMultipart } from "@/server/api/parse";
import {
  privateCommentForm,
  privateCommentResponse,
  streamIdParams,
} from "@/lib/schema/api";

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

registerRoute({
  method: "POST",
  path: "/streams/{streamId}/private-comments",
  summary:
    "Add a private comment (multipart: comment, userId, attachment). A student's goes to the teacher whatever userId says; the teacher must name an enrolled student in userId. 4 MB per request.",
  auth: "bearer",
  status: 201,
  params: streamIdParams,
  request: privateCommentForm,
  files: { attachment: "one" },
  response: privateCommentResponse,
  errors: [
    "unauthorized",
    "validation_failed",
    "payload_too_large",
    "forbidden",
    "not_found",
    "conflict",
  ],
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
          await streamForViewer(user.id, streamId),
        );
        const comments =
          (await getAllPrivateCommentsByStreamId(streamId)) ?? [];
        return ok(
          visiblePrivateComments(comments, user.id, classroom.teacherId),
        );
      }),
      POST: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { streamId } = parseParams(params, streamIdParams);
        const form = await readMultipart(request);
        const input = parseForm(form, privateCommentForm);
        const ref = fromOutcome(await streamRef(streamId));
        const comment = fromOutcome(
          await addPrivateCommentFlow(user, ref, {
            ...input,
            file: uploadableFiles(form.getAll("attachment"))[0] ?? null,
          }),
        );
        return ok(comment, 201);
      }),
    },
  },
});
