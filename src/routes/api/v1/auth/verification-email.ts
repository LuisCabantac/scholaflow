import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { parseJson } from "@/server/api/parse";
import { registerRoute } from "@/server/api/openapi";
import { handle, noContent } from "@/server/api/respond";
import { authResultToResponse } from "@/server/api/auth-results";
import { sendVerificationEmailFor } from "@/services/auth-requests";

const bodySchema = z.object({ email: z.email() });

registerRoute({
  method: "POST",
  path: "/auth/verification-email",
  summary: "Send the email verification link again",
  auth: "none",
  status: 202,
  request: bodySchema,
  response: z.object({ ok: z.literal(true) }),
  errors: ["validation_failed", "not_found", "conflict", "internal"],
});

export const Route = createFileRoute("/api/v1/auth/verification-email")({
  server: {
    handlers: {
      OPTIONS: handle(async () => noContent()),
      POST: handle(async ({ request }) => {
        const { email } = await parseJson(request, bodySchema);
        return authResultToResponse(await sendVerificationEmailFor(email));
      }),
    },
  },
});
