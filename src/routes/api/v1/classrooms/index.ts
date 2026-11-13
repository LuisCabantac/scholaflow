import { createFileRoute } from "@tanstack/react-router";

import { parseJson } from "@/server/api/parse";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { ApiError, fromOutcome } from "@/server/api/errors";
import { classroomView } from "@/server/authorize/classroom";
import { createClassFlow } from "@/services/classroom-flows";
import { handle, noContent, ok } from "@/server/api/respond";
import {
  classroomResponse,
  createClassBody,
  myClassesResponse,
} from "@/lib/schema/api";
import {
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
  getClassByClassId,
} from "@/services/classroom";

registerRoute({
  method: "GET",
  path: "/classrooms",
  summary: "Classes the caller teaches and is enrolled in",
  auth: "bearer",
  response: myClassesResponse,
  errors: ["unauthorized"],
});

registerRoute({
  method: "POST",
  path: "/classrooms",
  summary: "Create a class taught by the caller",
  auth: "bearer",
  status: 201,
  request: createClassBody,
  response: classroomResponse,
  errors: ["unauthorized", "validation_failed", "conflict"],
});

export const Route = createFileRoute("/api/v1/classrooms/")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      GET: handle(async ({ request }) => {
        const user = await requireApiUser(request);
        const [taught, enrolled] = await Promise.all([
          getAllClassesByTeacherId(user.id),
          getAllEnrolledClassesByUserId(user.id),
        ]);
        return ok({ taught: taught ?? [], enrolled: enrolled ?? [] });
      }),
      POST: handle(async ({ request }) => {
        const user = await requireApiUser(request);
        const input = await parseJson(request, createClassBody);
        const { id } = fromOutcome(await createClassFlow(user, input));
        const classroom = await getClassByClassId(id);
        if (!classroom) {
          throw new ApiError("not_found", "This class doesn't exist.");
        }
        return ok(classroomView(classroom, user.id), 201);
      }),
    },
  },
});
