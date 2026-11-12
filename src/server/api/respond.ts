import type { ApiErrorBody } from "@/types/api";
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

export function handle(fn: Handler): Handler {
  return async (ctx) => {
    try {
      return await fn(ctx);
    } catch (error) {
      return fail(error);
    }
  };
}
