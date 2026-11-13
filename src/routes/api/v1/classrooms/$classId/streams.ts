import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { parseParams } from "@/server/api/parse";
import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { handle, noContent, ok } from "@/server/api/respond";
import { getAllClassStreamsByClassId } from "@/services/stream";
import { visibleClassStreams } from "@/server/authorize/stream";
import { classIdParams, streamResponse } from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/classrooms/{classId}/streams",
  summary: "Posts of a class the caller may see",
  auth: "bearer",
  params: classIdParams,
  response: z.array(streamResponse),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
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
    },
  },
});
