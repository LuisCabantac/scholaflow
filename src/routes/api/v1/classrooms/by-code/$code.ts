import { createFileRoute } from "@tanstack/react-router";

import { ApiError } from "@/server/api/errors";
import { parseParams } from "@/server/api/parse";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { getClassByClassCode } from "@/services/classroom";
import { classroomView } from "@/server/authorize/classroom";
import { handle, noContent, ok } from "@/server/api/respond";
import { classroomResponse, codeParams } from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/classrooms/by-code/{code}",
  summary: "Look up a class by its invite code",
  auth: "bearer",
  params: codeParams,
  response: classroomResponse,
  errors: ["unauthorized", "validation_failed", "not_found"],
});

export const Route = createFileRoute("/api/v1/classrooms/by-code/$code")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      GET: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { code } = parseParams(params, codeParams);
        const classroom = await getClassByClassCode(code);
        if (!classroom) throw new ApiError("not_found", "Class not found");
        return ok(classroomView(classroom, user.id));
      }),
    },
  },
});
