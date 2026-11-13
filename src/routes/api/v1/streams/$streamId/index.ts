import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { uploadableFiles } from "@/lib/attachments";
import { registerRoute } from "@/server/api/openapi";
import { handle, noContent, ok } from "@/server/api/respond";
import { streamForViewer, streamRef } from "@/server/authorize/stream";
import { parseForm, parseParams, readMultipart } from "@/server/api/parse";
import { deleteStreamFlow, updateStreamFlow } from "@/services/stream-flows";
import {
  STREAM_LIST_FIELDS,
  streamIdParams,
  streamResponse,
  updateStreamForm,
} from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/streams/{streamId}",
  summary: "A post the caller may see",
  auth: "bearer",
  params: streamIdParams,
  response: streamResponse,
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

registerRoute({
  method: "PATCH",
  path: "/streams/{streamId}",
  summary:
    "Edit a post (author only, multipart, partial). An absent field keeps its stored value. title, description, dueDate, scheduledAt and points sent empty are cleared; topicId empty or no-topic removes the topic; announceTo, curUrlLinks and curAttachments sent once with an empty value become empty lists. links and attachments are additions; curAttachments lists the stored files to keep and the others are deleted. isAssignToAll=true re-reads the roster. type cannot change. 4 MB per request.",
  auth: "bearer",
  params: streamIdParams,
  request: updateStreamForm,
  files: { attachments: "many" },
  response: streamResponse,
  errors: [
    "unauthorized",
    "validation_failed",
    "payload_too_large",
    "forbidden",
    "not_found",
    "conflict",
  ],
});

registerRoute({
  method: "DELETE",
  path: "/streams/{streamId}",
  summary:
    "Delete a post with its comments, private comments, submissions, files and notifications (author or class teacher)",
  auth: "bearer",
  status: 204,
  params: streamIdParams,
  response: z.undefined(),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

export const Route = createFileRoute("/api/v1/streams/$streamId/")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      GET: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { streamId } = parseParams(params, streamIdParams);
        const { stream } = fromOutcome(
          await streamForViewer(user.id, streamId),
        );
        return ok(stream);
      }),
      PATCH: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { streamId } = parseParams(params, streamIdParams);
        const form = await readMultipart(request);
        const patch = parseForm(form, updateStreamForm, STREAM_LIST_FIELDS);
        const ref = fromOutcome(await streamRef(streamId));
        const { stream } = fromOutcome(
          await updateStreamFlow(user, ref, {
            ...patch,
            files: uploadableFiles(form.getAll("attachments")),
          }),
        );
        return ok(stream);
      }),
      DELETE: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { streamId } = parseParams(params, streamIdParams);
        const ref = fromOutcome(await streamRef(streamId));
        fromOutcome(await deleteStreamFlow(user, ref));
        return noContent();
      }),
    },
  },
});
