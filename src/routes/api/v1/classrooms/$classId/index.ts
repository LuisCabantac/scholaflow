import { createFileRoute } from "@tanstack/react-router";

import { ApiError } from "@/server/api/errors";
import { parseParams } from "@/server/api/parse";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { getClassByClassId } from "@/services/classroom";
import { classroomView } from "@/server/authorize/classroom";
import { handle, noContent, ok } from "@/server/api/respond";
import { classIdParams, classroomResponse } from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/classrooms/{classId}",
  summary: "A class (invite code only for its teacher)",
  auth: "bearer",
  params: classIdParams,
  response: classroomResponse,
  errors: ["unauthorized", "validation_failed", "not_found"],
});

export const Route = createFileRoute("/api/v1/classrooms/$classId/")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      GET: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        const classroom = await getClassByClassId(classId);
        if (!classroom) {
          throw new ApiError("not_found", "This class doesn't exist.");
        }
        return ok(classroomView(classroom, user.id));
      }),
    },
  },
});
