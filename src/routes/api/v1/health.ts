import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { handle, ok } from "@/server/api/respond";
import { registerRoute } from "@/server/api/openapi";

registerRoute({
  method: "GET",
  path: "/health",
  summary: "Service health",
  auth: "none",
  response: z.object({ status: z.literal("ok") }),
  errors: [],
});

export const Route = createFileRoute("/api/v1/health")({
  server: {
    handlers: {
      GET: handle(async () => ok({ status: "ok" })),
    },
  },
});
