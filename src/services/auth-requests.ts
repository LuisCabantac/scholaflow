import { sendEmail } from "@/services/email";
import { getAccountByUserId, getUserByEmail } from "@/services/user";
import type { AuthResult, TokenPurpose, TokenType } from "@/types/auth";
import { renderActionEmail } from "@/services/email-templates/action-email";
import { renderVerifyEmail } from "@/services/email-templates/verify-email";
import { buildAppUrl, isExpired, matchesTokenType } from "@/lib/auth-tokens";
import {
  deleteVerificationToken,
  generateVerificationToken,
  getVerificationToken,
} from "@/services/auth";

export async function hasUnexpiredToken(
  email: string,
  purpose: TokenPurpose,
  type: TokenType,
) {
  const existing = await getVerificationToken(email, purpose);

  return (
    existing !== null &&
    matchesTokenType(existing.value, type) &&
    !isExpired(existing.expiresAt)
  );
}

export async function deliver(
  to: string,
  purpose: TokenPurpose,
  rendered: { subject: string; html: string; text: string },
): Promise<AuthResult> {
  try {
    await sendEmail({ to, ...rendered });
  } catch {
    await deleteVerificationToken(to, purpose);
    return { success: false, code: "emailSendFailed" };
  }

  return { success: true, code: "verificationSent" };
}

export async function sendVerificationEmailFor(
  email: string,
): Promise<AuthResult> {
  const existingUser = await getUserByEmail(email);

  if (!existingUser) return { success: false, code: "emailNotFound" };
  if (existingUser.emailVerified) {
    return { success: false, code: "alreadyVerified" };
  }
  if (await hasUnexpiredToken(email, "verify", "uuid")) {
    return { success: false, code: "alreadySent" };
  }

  const token = await generateVerificationToken(email, "verify", "uuid");

  if (!token) return { success: false, code: "tokenGenerationFailed" };

  return deliver(
    email,
    "verify",
    renderVerifyEmail({
      toName: existingUser.name.split(" ")[0] ?? existingUser.name,
      verifyUrl: buildAppUrl(`/verify?token=${token.value}`),
    }),
  );
}

export async function requestPasswordResetFor(
  email: string,
): Promise<AuthResult> {
  if (await hasUnexpiredToken(email, "reset", "nanoid")) {
    return { success: false, code: "alreadySent" };
  }

  const existingUser = await getUserByEmail(email);

  if (!existingUser) return { success: false, code: "emailNotFound" };

  const account = await getAccountByUserId(existingUser.id);

  if (account?.providerId === "google") {
    return { success: false, code: "googleAccount" };
  }

  const token = await generateVerificationToken(email, "reset", "nanoid");

  if (!token) return { success: false, code: "tokenGenerationFailed" };

  return deliver(
    email,
    "reset",
    renderActionEmail({
      toName: existingUser.name.split(" ")[0] ?? existingUser.name,
      subject: "Reset Your ScholaFlow Password",
      title: "Let's reset your password",
      description:
        "We received a request to reset your ScholaFlow account password. If this was you, please click the button below to reset your password:",
      buttonColor: "#2563eb",
      buttonText: "Reset Password",
      actionUrl: buildAppUrl(`/reset-password?token=${token.value}`),
      footerMessage:
        "If you didn't request this password reset, please ignore this email or contact our support team. This link will expire in 1 day.",
    }),
  );
}
