import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { classIdParams } from "@/lib/schema/api";
import { parseParams } from "@/server/api/parse";
import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { handle, noContent } from "@/server/api/respond";
import { leaveClassFlow } from "@/services/classroom-flows";

registerRoute({
  method: "POST",
  path: "/classrooms/{classId}/leave",
  summary: "Leave a class the caller is enrolled in",
  auth: "bearer",
  status: 204,
  params: classIdParams,
  response: z.undefined(),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

export const Route = createFileRoute("/api/v1/classrooms/$classId/leave")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      POST: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        fromOutcome(await leaveClassFlow(user, classId));
        return noContent();
      }),
    },
  },
});
