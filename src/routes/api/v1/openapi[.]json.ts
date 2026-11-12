import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { handle, ok } from "@/server/api/respond";
import { buildOpenApi, registerRoute } from "@/server/api/openapi";

registerRoute({
  method: "GET",
  path: "/openapi.json",
  summary: "OpenAPI document",
  auth: "none",
  response: z.object({ openapi: z.string() }),
  errors: [],
});

export const Route = createFileRoute("/api/v1/openapi.json")({
  server: {
    handlers: {
      GET: handle(async () =>
        ok(buildOpenApi(), 200, { "cache-control": "public, max-age=300" }),
      ),
    },
  },
});
