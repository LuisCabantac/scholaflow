import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { getClassByClassId } from "@/services/classroom";
import { ApiError, fromOutcome } from "@/server/api/errors";
import { parseJson, parseParams } from "@/server/api/parse";
import { classroomView } from "@/server/authorize/classroom";
import { handle, noContent, ok } from "@/server/api/respond";
import { deleteClassFlow, updateClassFlow } from "@/services/classroom-flows";
import {
  classIdParams,
  classroomResponse,
  updateClassBody,
} from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/classrooms/{classId}",
  summary: "A class (invite code only for its teacher)",
  auth: "bearer",
  params: classIdParams,
  response: classroomResponse,
  errors: ["unauthorized", "validation_failed", "not_found"],
});

registerRoute({
  method: "PATCH",
  path: "/classrooms/{classId}",
  summary: "Update a class (teacher only)",
  auth: "bearer",
  params: classIdParams,
  request: updateClassBody,
  response: classroomResponse,
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

registerRoute({
  method: "DELETE",
  path: "/classrooms/{classId}",
  summary: "Delete a class and everything in it (teacher only)",
  auth: "bearer",
  status: 204,
  params: classIdParams,
  response: z.undefined(),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
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
      PATCH: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        const input = await parseJson(request, updateClassBody);
        fromOutcome(await updateClassFlow(user, classId, input));
        const classroom = await getClassByClassId(classId);
        if (!classroom) {
          throw new ApiError("not_found", "This class doesn't exist.");
        }
        return ok(classroomView(classroom, user.id));
      }),
      DELETE: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        fromOutcome(await deleteClassFlow(user, classId));
        return noContent();
      }),
    },
  },
});
