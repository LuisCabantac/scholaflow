import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { user } from "@/db/schema";
import type { AuthResult } from "@/types/auth";
import { deleteFilesFromBucket } from "@/services/user-management";
import { renderActionEmail } from "@/services/email-templates/action-email";
import {
  collectUserFiles,
  deleteUserCascade,
} from "@/services/account-deletion";
import {
  getAccountByUserId,
  getUserByEmail,
  getUserIdById,
} from "@/services/user";
import {
  buildAppUrl,
  isExpired,
  matchesTokenType,
  parseTokenIdentifier,
} from "@/lib/auth-tokens";
import {
  deleteVerificationToken,
  generateVerificationToken,
  getVerificationTokenByToken,
} from "@/services/auth";
import {
  deliver,
  hasUnexpiredToken,
  requestPasswordResetFor,
  sendVerificationEmailFor,
} from "@/services/auth-requests";

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return session;
  },
);

export const sendVerificationEmailFn = createServerFn({ method: "POST" })
  .validator((email: string) => email)
  .handler(
    async ({ data: email }): Promise<AuthResult> =>
      sendVerificationEmailFor(email),
  );

export const requestPasswordResetFn = createServerFn({ method: "POST" })
  .validator((email: string) => email)
  .handler(
    async ({ data: email }): Promise<AuthResult> =>
      requestPasswordResetFor(email),
  );

export const requestAccountClosureFn = createServerFn({ method: "POST" })
  .validator((email: string) => email)
  .handler(async ({ data: email }): Promise<AuthResult> => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.email !== email) {
      return { success: false, code: "noAccount" };
    }

    if (await hasUnexpiredToken(email, "close", "uuid")) {
      return { success: false, code: "alreadySent" };
    }

    const token = await generateVerificationToken(email, "close", "uuid");

    if (!token) return { success: false, code: "tokenGenerationFailed" };

    return deliver(
      email,
      "close",
      renderActionEmail({
        toName: session.user.name.split(" ")[0] ?? session.user.name,
        subject: "Confirm Your ScholaFlow Account Deletion",
        title: "Sorry to see you go",
        description:
          "We received a request to close your ScholaFlow account. If this was you, please click the button below to confirm and permanently delete your account:",
        buttonColor: "#dc2626",
        buttonText: "Confirm Account Closure",
        warningMessage:
          "This action cannot be undone. All your data will be permanently deleted.",
        actionUrl: buildAppUrl(`/close-account?token=${token.value}`),
        footerMessage:
          "If you didn't request this account closure, please ignore this email or contact our support team. This link will expire in 1 day.",
      }),
    );
  });

export const verifyEmailVerificationFn = createServerFn({ method: "POST" })
  .validator((token: string) => token)
  .handler(async ({ data: token }): Promise<AuthResult> => {
    const tokenData = await getVerificationTokenByToken(token);

    if (!tokenData) return { success: false, code: "invalidLink" };

    const parsed = parseTokenIdentifier(tokenData.identifier);

    if (!parsed || parsed.purpose !== "verify") {
      return { success: false, code: "invalidLink" };
    }

    if (isExpired(tokenData.expiresAt)) {
      await deleteVerificationToken(parsed.email, "verify");
      return { success: false, code: "linkExpired" };
    }

    const existingUser = await getUserIdById(parsed.email);

    if (!existingUser) return { success: false, code: "noAccount" };

    const [updatedUser] = await db
      .update(user)
      .set({ emailVerified: true })
      .where(eq(user.id, existingUser.id))
      .returning();

    if (!updatedUser) return { success: false, code: "verifyFailed" };

    await deleteVerificationToken(parsed.email, "verify");

    return { success: true, code: "emailVerified" };
  });

export const closeUserAccountFn = createServerFn({ method: "POST" })
  .validator((token: string) => token)
  .handler(async ({ data: token }): Promise<AuthResult> => {
    const tokenData = await getVerificationTokenByToken(token);

    if (!tokenData) return { success: false, code: "invalidLink" };

    const parsed = parseTokenIdentifier(tokenData.identifier);

    if (!parsed || parsed.purpose !== "close") {
      return { success: false, code: "invalidLink" };
    }

    if (isExpired(tokenData.expiresAt)) {
      await deleteVerificationToken(parsed.email, "close");
      return { success: false, code: "linkExpired" };
    }

    const existingUser = await getUserByEmail(parsed.email);

    if (!existingUser) return { success: false, code: "noAccount" };

    const files = await collectUserFiles(existingUser.id);
    const deletedUser = await deleteUserCascade(existingUser.id);

    if (!deletedUser) return { success: false, code: "closeFailed" };

    for (const group of files) {
      await deleteFilesFromBucket(group.bucket, group.paths).catch(() => null);
    }

    await deleteVerificationToken(parsed.email, "close");

    return { success: true, code: "accountClosed" };
  });

export const updateUserPasswordFn = createServerFn({ method: "POST" })
  .validator((data: { token: string; newPassword: string }) => data)
  .handler(async ({ data: { token, newPassword } }): Promise<AuthResult> => {
    const tokenData = await getVerificationTokenByToken(token);

    if (!tokenData) return { success: false, code: "invalidLink" };

    if (!matchesTokenType(tokenData.value, "nanoid")) {
      return { success: false, code: "invalidTokenFormat" };
    }

    const parsed = parseTokenIdentifier(tokenData.identifier);

    if (!parsed || parsed.purpose !== "reset") {
      return { success: false, code: "invalidLink" };
    }

    if (isExpired(tokenData.expiresAt)) {
      await deleteVerificationToken(parsed.email, "reset");
      return { success: false, code: "linkExpired" };
    }

    const existingUser = await getUserByEmail(parsed.email);

    if (!existingUser) return { success: false, code: "noAccount" };

    if (newPassword.length < 8) {
      return { success: false, code: "passwordTooShort" };
    }

    if (newPassword.length > 20) {
      return { success: false, code: "passwordTooLong" };
    }

    const account = await getAccountByUserId(existingUser.id);

    if (account?.providerId === "google") {
      return { success: false, code: "googleAccount" };
    }

    const ctx = await auth.$context;
    const hash = await ctx.password.hash(newPassword);

    await ctx.internalAdapter.updatePassword(existingUser.id, hash);
    await deleteVerificationToken(parsed.email, "reset");

    return { success: true, code: "passwordUpdated" };
  });
