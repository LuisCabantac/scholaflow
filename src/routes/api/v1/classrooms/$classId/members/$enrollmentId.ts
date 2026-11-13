import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { parseParams } from "@/server/api/parse";
import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { enrollmentParams } from "@/lib/schema/api";
import { registerRoute } from "@/server/api/openapi";
import { handle, noContent } from "@/server/api/respond";
import { removeMemberFlow } from "@/services/classroom-flows";

registerRoute({
  method: "DELETE",
  path: "/classrooms/{classId}/members/{enrollmentId}",
  summary: "Remove a member (teacher, or the member themselves)",
  auth: "bearer",
  status: 204,
  params: enrollmentParams,
  response: z.undefined(),
  errors: [
    "unauthorized",
    "validation_failed",
    "forbidden",
    "not_found",
    "conflict",
  ],
});

export const Route = createFileRoute(
  "/api/v1/classrooms/$classId/members/$enrollmentId",
)({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      DELETE: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId, enrollmentId } = parseParams(params, enrollmentParams);
        fromOutcome(await removeMemberFlow(user, classId, enrollmentId));
        return noContent();
      }),
    },
  },
});
