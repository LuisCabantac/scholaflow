import { describe, expect, it } from "vitest";

import type { ApiErrorCode } from "@/types/api";
import {
  API_ERROR_STATUS,
  ApiError,
  fromOutcome,
  toApiError,
} from "@/server/api/errors";

const table: [ApiErrorCode, number][] = [
  ["unauthorized", 401],
  ["forbidden", 403],
  ["not_found", 404],
  ["validation_failed", 400],
  ["conflict", 409],
  ["payload_too_large", 413],
  ["rate_limited", 429],
  ["internal", 500],
];

describe("API_ERROR_STATUS", () => {
  it.each(table)("maps %s to %i", (code, status) => {
    expect(API_ERROR_STATUS[code]).toBe(status);
  });

  it("covers exactly the eight codes", () => {
    expect(Object.keys(API_ERROR_STATUS).sort()).toEqual(
      table.map(([code]) => code).sort(),
    );
  });
});

describe("fromOutcome", () => {
  it("returns the value of an ok outcome", () => {
    expect(fromOutcome({ ok: true, value: 1 })).toBe(1);
  });

  it("throws an ApiError carrying the failed outcome's code and message", () => {
    expect(() =>
      fromOutcome({ ok: false, code: "forbidden", message: "No." }),
    ).toThrowError(
      expect.objectContaining({ code: "forbidden", message: "No." }),
    );
    try {
      fromOutcome({ ok: false, code: "forbidden", message: "No." });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
    }
  });
});

describe("toApiError", () => {
  it("returns an ApiError unchanged", () => {
    const error = new ApiError("not_found", "x");
    expect(toApiError(error)).toBe(error);
  });

  it("hides unknown errors behind a generic internal error", () => {
    const error = toApiError(new Error("db down"));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("internal");
    expect(error.message).toBe("Something went wrong.");
    expect(error.message).not.toContain("db down");
  });

  it("keeps details on an ApiError", () => {
    const error = new ApiError("validation_failed", "Invalid.", [
      { path: ["a"] },
    ]);
    expect(toApiError(error).details).toEqual([{ path: ["a"] }]);
  });
});
