import { createFileRoute } from "@tanstack/react-router";

import { requireApiUser } from "@/server/api/auth";
import { myClassesResponse } from "@/lib/schema/api";
import { registerRoute } from "@/server/api/openapi";
import { handle, noContent, ok } from "@/server/api/respond";
import {
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
} from "@/services/classroom";

registerRoute({
  method: "GET",
  path: "/classrooms",
  summary: "Classes the caller teaches and is enrolled in",
  auth: "bearer",
  response: myClassesResponse,
  errors: ["unauthorized"],
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
    },
  },
});
