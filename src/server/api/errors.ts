import type { ApiErrorCode, Outcome } from "@/types/api";

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const API_ERROR_STATUS: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  validation_failed: 400,
  conflict: 409,
  payload_too_large: 413,
  rate_limited: 429,
  internal: 500,
};

export function fromOutcome<T>(outcome: Outcome<T>): T {
  if (outcome.ok) return outcome.value;
  throw new ApiError(outcome.code, outcome.message);
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError("internal", "Something went wrong.");
}
