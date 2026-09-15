import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { user } from "@/db/schema";
import { extractAvatarFilePath } from "@/lib/utils";
import { deleteAllMessagesByUserId } from "@/services/message";
import { deleteNote, getAllNotesByUserId } from "@/services/notes";
import { deleteAllNotificationsByUserId } from "@/services/notification";
import {
  deleteFileFromBucket,
  removeRoleRequestByUserId,
} from "@/services/user-management";
import {
  deleteClassStreamPost,
  getAllClassesStreamByUserId,
} from "@/services/stream";
import {
  deleteAllCommentsByUserId,
  deleteAllPrivateCommentsByUserId,
} from "@/services/comment";
import {
  getUserByEmail,
  getUserIdById,
  deleteUserRecord,
} from "@/services/user";
import {
  deleteVerificationToken,
  generateVerificationToken,
  getVerificationTokenByToken,
} from "@/services/auth";
import {
  deleteClass,
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
  deleteEnrolledClassbyClassAndEnrolledClassId,
} from "@/services/classroom";

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return session;
  },
);

export const ensureSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw new Error("Unauthorized");
    }

    return session;
  },
);

export const checkEmailFn = createServerFn({ method: "POST" })
  .validator((email: string) => email)
  .handler(async ({ data: email }) => {
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return {
        type: "verification",
        success: { status: true, message: "Email Verification was sent" },
      };
    } else {
      return {
        type: "email",
        success: {
          status: false,
          message: "This email has already been taken.",
        },
      };
    }
  });

export const checkVerificationTokenFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; tokenType: "uuid" | "nanoid" }) => data)
  .handler(async ({ data }) => {
    const { email, tokenType } = data;

    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return { success: false, message: "The email address does not exist." };
    }

    const newVerification = await generateVerificationToken(email, tokenType);

    if (!newVerification) {
      return { success: false, message: "Failed to generate token" };
    }

    return {
      success: true,
      message: "Token generated",
      data: newVerification,
    };
  });

export const verifyEmailVerificationFn = createServerFn({ method: "POST" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    const tokenData = await getVerificationTokenByToken(token);

    if (!tokenData) return { success: false, message: "Invalid link." };

    const hasExpired = new Date(tokenData.expiresAt) < new Date();
    if (hasExpired) {
      await deleteVerificationToken(tokenData.identifier);
      return { success: false, message: "This link has expired." };
    }

    const existingUser = await getUserIdById(tokenData.identifier);

    if (!existingUser) return { success: false, message: "No account found." };

    await db
      .update(user)
      .set({ emailVerified: true })
      .where(eq(user.id, existingUser.id));

    await deleteVerificationToken(tokenData.identifier);

    return { success: true, message: "Your email is confirmed!" };
  });

export const closeUserAccountFn = createServerFn({ method: "POST" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    const tokenData = await getVerificationTokenByToken(token);

    if (!tokenData) return { success: false, message: "Invalid link." };

    const hasExpired = new Date(tokenData.expiresAt) < new Date();
    if (hasExpired) {
      await deleteVerificationToken(tokenData.identifier);
      return { success: false, message: "This link has expired." };
    }

    const existingUser = await getUserByEmail(tokenData.identifier);
    if (!existingUser) return { success: false, message: "No account found." };

    await deleteAllMessagesByUserId(existingUser.id);
    await deleteAllCommentsByUserId(existingUser.id);
    await deleteAllPrivateCommentsByUserId(existingUser.id);

    const posts = await getAllClassesStreamByUserId(existingUser.id);
    if (posts?.length) {
      for (const post of posts) {
        await deleteClassStreamPost(post.id);
      }
    }

    const enrolledClasses = await getAllEnrolledClassesByUserId(
      existingUser.id,
    );
    if (enrolledClasses?.length) {
      for (const enrolledClass of enrolledClasses) {
        await deleteEnrolledClassbyClassAndEnrolledClassId(
          enrolledClass.id,
          enrolledClass.classId,
        );
      }
    }

    const createdClasses = await getAllClassesByTeacherId(existingUser.id);
    if (createdClasses?.length) {
      for (const createdClass of createdClasses) {
        await deleteClass(createdClass.id);
      }
    }

    const allNotes = await getAllNotesByUserId(existingUser.id);
    if (allNotes?.length) {
      for (const note of allNotes) {
        await deleteNote(note.id);
      }
    }

    await deleteAllNotificationsByUserId(existingUser.id);
    await removeRoleRequestByUserId(existingUser.id);

    if (
      existingUser.image &&
      !existingUser.image.startsWith("https://lh3.googleusercontent.com/")
    ) {
      const filePath = extractAvatarFilePath(existingUser.image);
      await deleteFileFromBucket("avatars", filePath);
    }

    await deleteUserRecord(existingUser.id);
    await deleteVerificationToken(tokenData.identifier);

    return { success: true, message: "Account closed successfully." };
  });

export const updateUserPasswordFn = createServerFn({ method: "POST" })
  .validator((data: { token: string; newPassword: string }) => data)
  .handler(async ({ data }) => {
    const { token, newPassword } = data;

    if (newPassword.length < 8)
      return { success: false, message: "Password too short." };

    const tokenData = await getVerificationTokenByToken(token);
    if (!tokenData) return { success: false, message: "Invalid link." };

    const existingUser = await getUserByEmail(tokenData.identifier);
    if (!existingUser) return { success: false, message: "No account found." };

    const ctx = await auth.$context;
    const hash = await ctx.password.hash(newPassword);
    await ctx.internalAdapter.updatePassword(existingUser.id, hash);

    await deleteVerificationToken(tokenData.identifier);

    return { success: true, message: "Password updated successfully!" };
  });
