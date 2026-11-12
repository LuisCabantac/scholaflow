import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { handle, ok } from "@/server/api/respond";
import { requireApiUser } from "@/server/api/auth";
import { registerRoute } from "@/server/api/openapi";

const meSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  role: z.string(),
  schoolName: z.string().nullable(),
  emailVerified: z.boolean(),
});

registerRoute({
  method: "GET",
  path: "/me",
  summary: "The signed-in user",
  auth: "bearer",
  response: meSchema,
  errors: ["unauthorized"],
});

export const Route = createFileRoute("/api/v1/me")({
  server: {
    handlers: {
      GET: handle(async ({ request }) => {
        const user = await requireApiUser(request);
        return ok({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          role: user.role,
          schoolName: user.schoolName ?? null,
          emailVerified: user.emailVerified,
        });
      }),
    },
  },
});
