import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { parseJson } from "@/server/api/parse";
import { joinClassBody } from "@/lib/schema/api";
import { fromOutcome } from "@/server/api/errors";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";
import { joinClassFlow } from "@/services/classroom-flows";
import { handle, noContent, ok } from "@/server/api/respond";

registerRoute({
  method: "POST",
  path: "/classrooms/join",
  summary: "Join a class by invite code",
  auth: "bearer",
  status: 201,
  request: joinClassBody,
  response: z.object({ classId: z.string() }),
  errors: ["unauthorized", "validation_failed", "not_found", "conflict"],
});

export const Route = createFileRoute("/api/v1/classrooms/join")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      POST: handle(async ({ request }) => {
        const user = await requireApiUser(request);
        const { code } = await parseJson(request, joinClassBody);
        return ok(fromOutcome(await joinClassFlow(user, code)), 201);
      }),
    },
  },
});
