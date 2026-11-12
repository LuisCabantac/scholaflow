import type { z } from "zod";

import { ApiError } from "@/server/api/errors";

function validate<T>(value: unknown, schema: z.ZodType<T>, message: string): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  throw new ApiError("validation_failed", message, result.error.issues);
}

export async function parseJson<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError("validation_failed", "Invalid request body.");
  }
  return validate(body, schema, "Invalid request body.");
}

export function parseParams<T>(
  params: Record<string, string>,
  schema: z.ZodType<T>,
): T {
  return validate(params, schema, "Invalid route parameters.");
}

export function parseQuery<T>(request: Request, schema: z.ZodType<T>): T {
  const query = Object.fromEntries(new URL(request.url).searchParams);
  return validate(query, schema, "Invalid query parameters.");
}
