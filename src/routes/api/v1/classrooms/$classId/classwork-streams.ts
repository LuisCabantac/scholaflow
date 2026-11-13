import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { handle, noContent, ok } from "@/server/api/respond";
import { parseParams, parseQuery } from "@/server/api/parse";
import { visibleClassStreams } from "@/server/authorize/stream";
import {
  classIdParams,
  classworkSearchQuery,
  streamResponse,
} from "@/lib/schema/api";
import {
  getAllClassworkStreamsByClassId,
  getClassworksByClassIdQuery,
} from "@/services/stream";

registerRoute({
  method: "GET",
  path: "/classrooms/{classId}/classwork-streams",
  summary:
    "Classwork posts of a class the caller may see, optionally searched by title",
  auth: "bearer",
  params: classIdParams,
  query: classworkSearchQuery,
  response: z.array(streamResponse),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

export const Route = createFileRoute(
  "/api/v1/classrooms/$classId/classwork-streams",
)({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      GET: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        const { q } = parseQuery(request, classworkSearchQuery);
        const load = q
          ? (id: string) => getClassworksByClassIdQuery(id, q)
          : getAllClassworkStreamsByClassId;
        const streams = fromOutcome(
          await visibleClassStreams(user.id, classId, load),
        );
        return ok(streams);
      }),
    },
  },
});
