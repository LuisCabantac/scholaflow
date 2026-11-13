import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { parseParams } from "@/server/api/parse";
import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { handle, noContent, ok } from "@/server/api/respond";
import { classroomForMember } from "@/server/authorize/classroom";
import { getAllEnrolledClassesByClassId } from "@/services/classroom";
import { classIdParams, enrolledClassResponse } from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/classrooms/{classId}/members",
  summary: "The class roster",
  auth: "bearer",
  params: classIdParams,
  response: z.array(enrolledClassResponse),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

export const Route = createFileRoute("/api/v1/classrooms/$classId/members")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      GET: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        fromOutcome(await classroomForMember(user.id, classId));
        return ok((await getAllEnrolledClassesByClassId(classId)) ?? []);
      }),
    },
  },
});
