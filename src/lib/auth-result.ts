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
