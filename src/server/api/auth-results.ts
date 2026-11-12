import { ApiError } from "@/server/api/errors";
import { fail, ok } from "@/server/api/respond";
import type { ApiErrorCode } from "@/types/api";
import type { AuthResult, AuthResultCode } from "@/types/auth";

const failureCodes: Partial<Record<AuthResultCode, [ApiErrorCode, string]>> = {
  emailNotFound: ["not_found", "No account uses that email address."],
  alreadySent: ["conflict", "An email was already sent. Check your inbox."],
  alreadyVerified: ["conflict", "This email address is already verified."],
  googleAccount: ["conflict", "This account signs in with Google."],
  emailSendFailed: ["internal", "The email could not be sent."],
  tokenGenerationFailed: ["internal", "The request could not be processed."],
};

export function authResultToResponse(result: AuthResult): Response {
  if (result.success) return ok({ ok: true }, 202);

  const [code, message] = failureCodes[result.code] ?? [
    "internal",
    "The request could not be processed.",
  ];
  return fail(new ApiError(code, message));
}
