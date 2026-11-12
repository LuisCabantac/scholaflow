import { describe, expect, it } from "vitest";

import type { AuthResultCode } from "@/types/auth";
import { authResultToResponse } from "@/server/api/auth-results";

const cases: [AuthResultCode, number, string | null][] = [
  ["verificationSent", 202, null],
  ["emailNotFound", 404, "not_found"],
  ["alreadySent", 409, "conflict"],
  ["alreadyVerified", 409, "conflict"],
  ["googleAccount", 409, "conflict"],
  ["emailSendFailed", 500, "internal"],
  ["tokenGenerationFailed", 500, "internal"],
];

describe("authResultToResponse", () => {
  it.each(cases)("maps %s to %i", async (code, status, errorCode) => {
    const response = authResultToResponse({ success: status === 202, code });
    expect(response.status).toBe(status);
    const body = await response.json();
    if (errorCode) expect(body.error.code).toBe(errorCode);
    else expect(body).toEqual({ ok: true });
  });

  it("falls back to internal for an unexpected failure code", async () => {
    const response = authResultToResponse({
      success: false,
      code: "invalidLink",
    });
    expect(response.status).toBe(500);
  });
});
