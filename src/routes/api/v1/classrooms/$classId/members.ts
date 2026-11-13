import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { addMemberFlow } from "@/services/classroom-flows";
import { parseJson, parseParams } from "@/server/api/parse";
import { handle, noContent, ok } from "@/server/api/respond";
import { classroomForMember } from "@/server/authorize/classroom";
import { getAllEnrolledClassesByClassId } from "@/services/classroom";
import {
  addMemberBody,
  classIdParams,
  enrolledClassResponse,
} from "@/lib/schema/api";

registerRoute({
  method: "GET",
  path: "/classrooms/{classId}/members",
  summary: "The class roster",
  auth: "bearer",
  params: classIdParams,
  response: z.array(enrolledClassResponse),
  errors: ["unauthorized", "validation_failed", "forbidden", "not_found"],
});

registerRoute({
  method: "POST",
  path: "/classrooms/{classId}/members",
  summary: "Add a user to the class by email (teacher only)",
  auth: "bearer",
  status: 201,
  params: classIdParams,
  request: addMemberBody,
  response: z.object({ enrollmentId: z.string() }),
  errors: [
    "unauthorized",
    "validation_failed",
    "forbidden",
    "not_found",
    "conflict",
  ],
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
      POST: handle(async ({ request, params }) => {
        const user = await requireApiUser(request);
        const { classId } = parseParams(params, classIdParams);
        const { email } = await parseJson(request, addMemberBody);
        return ok(fromOutcome(await addMemberFlow(user, classId, email)), 201);
      }),
    },
  },
});
