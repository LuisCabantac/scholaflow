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

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const FORM_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
const FORM_OVERHEAD_BYTES = 256 * 1024;
const tooLarge = () =>
  new ApiError("payload_too_large", "Uploads are limited to 4 MB per request.");

export async function readMultipart(
  request: Request,
  maxBytes = MAX_UPLOAD_BYTES,
): Promise<FormData> {
  const type = (request.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!FORM_TYPES.includes(type)) {
    throw new ApiError("validation_failed", "Expected multipart/form-data.");
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes + FORM_OVERHEAD_BYTES) throw tooLarge();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw new ApiError("validation_failed", "Invalid request body.");
  }

  let total = 0;
  for (const value of form.values()) {
    if (typeof value !== "string") total += value.size;
  }
  if (total > maxBytes) throw tooLarge();

  return form;
}

export function parseForm<T>(
  formData: FormData,
  schema: z.ZodType<T>,
  listKeys: readonly string[] = [],
): T {
  const record: Record<string, string | string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    if (listKeys.includes(key)) {
      const list = (record[key] as string[] | undefined) ?? [];
      if (value !== "") list.push(value);
      record[key] = list;
    } else {
      record[key] = value;
    }
  }
  return validate(record, schema, "Invalid request body.");
}
