import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { uploadableFiles } from "@/lib/attachments";
import { registerRoute } from "@/server/api/openapi";
import { createStreamFlow } from "@/services/stream-flows";
import { handle, noContent, ok } from "@/server/api/respond";
import { getAllClassStreamsByClassId } from "@/services/stream";
import { visibleClassStreams } from "@/server/authorize/stream";
import { parseForm, parseParams, readMultipart } from "@/server/api/parse";
import {
  classIdParams,
  createStreamForm,
  STREAM_LIST_FIELDS,
  streamResponse,
} from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/classrooms/{classId}/streams",
  summary: "Posts of a class the caller may see",
  auth: "bearer",
  params: classIdParams,
  response: z.array(streamResponse),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

registerRoute({
  method: "POST",
  path: "/classrooms/{classId}/streams",
  summary:
    "Create a post (multipart). Students may post only the stream type and only when the class allows it. Files go in attachments, 4 MB per request.",
  auth: "bearer",
  status: 201,
  params: classIdParams,
  request: createStreamForm,
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

export const Route = createFileRoute("/api/v1/classrooms/$classId/streams")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      GET: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        const streams = fromOutcome(
          await visibleClassStreams(
            user.id,
            classId,
            getAllClassStreamsByClassId,
          ),
        );
        return ok(streams);
      }),
      POST: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        const form = await readMultipart(request);
        const input = parseForm(form, createStreamForm, STREAM_LIST_FIELDS);
        const stream = fromOutcome(
          await createStreamFlow(user, classId, {
            ...input,
            files: uploadableFiles(form.getAll("attachments")),
          }),
        );
        return ok(stream, 201);
      }),
    },
  },
});
