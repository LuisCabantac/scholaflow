import type { getSession } from "@/server/functions/auth";

export type TokenType = "uuid" | "nanoid";

export type TokenPurpose = "verify" | "reset" | "close";

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof getSession>>
>["user"];

export type AuthResultCode =
  | "verificationSent"
  | "alreadySent"
  | "alreadyVerified"
  | "emailNotFound"
  | "googleAccount"
  | "tokenGenerationFailed"
  | "emailSendFailed"
  | "invalidLink"
  | "linkExpired"
  | "noAccount"
  | "emailVerified"
  | "verifyFailed"
  | "accountClosed"
  | "closeFailed"
  | "passwordUpdated"
  | "passwordTooShort"
  | "passwordTooLong"
  | "invalidTokenFormat";

export type AuthResult = { success: boolean; code: AuthResultCode };
