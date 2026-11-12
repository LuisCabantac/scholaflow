import type { ApiErrorBody } from "@/types/api";
import { allowedOrigins, corsHeaders } from "@/server/api/cors";
import { API_ERROR_STATUS, toApiError } from "@/server/api/errors";

export type HandlerContext = {
  request: Request;
  params: Record<string, string>;
};

export type Handler = (ctx: HandlerContext) => Promise<Response>;

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

export function ok(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...jsonHeaders, ...headers },
  });
}

export function noContent(): Response {
  return new Response(null, { status: 204 });
}

export function fail(error: unknown): Response {
  const apiError = toApiError(error);
  const body: ApiErrorBody = {
    error: { code: apiError.code, message: apiError.message },
  };

  if (apiError.details !== undefined) body.error.details = apiError.details;

  return new Response(JSON.stringify(body), {
    status: API_ERROR_STATUS[apiError.code],
    headers: jsonHeaders,
  });
}

function withCors(response: Response, cors: Headers): Response {
  if (![...cors.keys()].length) return response;

  const headers = new Headers(response.headers);
  for (const [key, value] of cors.entries()) headers.set(key, value);
  return new Response(response.body, { status: response.status, headers });
}

export function handle(fn: Handler, origins = allowedOrigins()): Handler {
  return async (ctx) => {
    const cors = corsHeaders(ctx.request, origins);
    if (ctx.request.method === "OPTIONS") return withCors(noContent(), cors);

    try {
      return withCors(await fn(ctx), cors);
    } catch (error) {
      return withCors(fail(error), cors);
    }
  };
}
