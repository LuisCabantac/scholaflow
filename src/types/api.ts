export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation_failed"
  | "conflict"
  | "payload_too_large"
  | "rate_limited"
  | "internal";

export type OutcomeErrorCode = Exclude<
  ApiErrorCode,
  "validation_failed" | "payload_too_large" | "rate_limited" | "internal"
>;

export type ApiErrorBody = {
  error: { code: ApiErrorCode; message: string; details?: unknown };
};

export type Outcome<T> =
  | { ok: true; value: T }
  | { ok: false; code: OutcomeErrorCode; message: string };
