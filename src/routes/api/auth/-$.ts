import { createAPIFileRoute } from "@tanstack/start-api-routes";

import { auth } from "@/lib/auth";

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  GET: async ({ request }: { request: Request }) => {
    return await auth.handler(request);
  },
  POST: async ({ request }: { request: Request }) => {
    return await auth.handler(request);
  },
});
