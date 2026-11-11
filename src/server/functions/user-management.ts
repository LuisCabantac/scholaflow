import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { extractAvatarFilePath } from "@/lib/utils";
import { uploadAttachments } from "@/services/storage";
import { userDetailsChanged } from "@/lib/user-search";
import { isUploadedAvatarUrl } from "@/lib/default-avatar";
import { deleteUserCascade } from "@/services/account-deletion";
import type { UserMutationResult } from "@/types/user-management";
import {
  isAvatarFile,
  isAvatarTooLarge,
  pickPasswordAccount,
} from "@/lib/profile-form";
import {
  createRoleRequestSchema,
  createUserSchema,
  editUserDetailsSchema,
  editUserSchema,
} from "@/lib/schema";
import {
  deleteUserRecord,
  getAccountsByUserId,
  getUserByEmail,
  getUserByUserId,
  updateUserRecord,
} from "@/services/user";
import {
  createRoleRequestRecord,
  deleteFileFromBucket,
  deleteRoleRequestRecord,
  getAllRoleRequests,
  getRoleRequest,
  removeRoleRequestByUserId,
  updateRoleRequestRecord,
} from "@/services/user-management";

export const getRoleRequestFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;
    if (session.user.id !== userId && session.user.role !== "admin") {
      return null;
    }

    return await getRoleRequest(userId);
  });

export const getAllRoleRequestsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role !== "admin") return [];

    return await getAllRoleRequests();
  },
);

export const requestTeacherRoleFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "You must be logged in." };

    const userId = formData.get("userId") as string;

    if (userId !== session.user.id) {
      return {
        success: false,
        message: "You can only request a role for your own account.",
      };
    }

    const userData = await getUserByUserId(userId);

    if (!userData) return { success: false, message: "User does not exist." };
    if (userData.role === "admin")
      return { success: false, message: "Admin users do not need requests." };

    const existingRequest = await getRoleRequest(userId);
    if (existingRequest?.status === "pending") {
      return {
        success: false,
        message: "Request already submitted. Please wait.",
      };
    }
    if (existingRequest) await removeRoleRequestByUserId(userId);

    const request = {
      userId,
      userName: userData.name,
      userEmail: userData.email,
      userImage: userData.image,
      status: "pending" as const,
    };

    const result = createRoleRequestSchema.safeParse(request);
    if (result.error) {
      return {
        success: false,
        message: "Invalid request data. Please check all fields and try again.",
      };
    }

    const data = await createRoleRequestRecord(result.data);
    if (!data) return { success: false, message: "Failed to submit request." };

    return {
      success: true,
      message: "Your request to become a Teacher has been submitted.",
    };
  });

export const approveRoleRequestFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string; requestId: string }) => data)
  .handler(async ({ data: { userId, requestId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };
    if (session.user.role !== "admin")
      return {
        success: false,
        message: "Only an admin can perform this action.",
      };

    const userRequest = await getRoleRequest(userId);
    if (!userRequest)
      return { success: false, message: "Request doesn't exist." };

    await updateUserRecord(userId, { role: "user" });
    await deleteRoleRequestRecord(requestId, userId);

    return { success: true, message: "Request approved." };
  });

export const rejectRoleRequestFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string; requestId: string }) => data)
  .handler(async ({ data: { userId, requestId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role !== "admin")
      return { success: false, message: "Unauthorized" };

    const userRequest = await getRoleRequest(userId);
    if (!userRequest)
      return { success: false, message: "Request doesn't exist." };

    await updateRoleRequestRecord(requestId, "rejected");

    return { success: true, message: "Request rejected." };
  });

export const removeRoleRequestFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string; requestId: string }) => data)
  .handler(async ({ data: { userId, requestId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };
    if (session.user.role !== "admin" && session.user.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }

    await deleteRoleRequestRecord(requestId, userId);

    return { success: true, message: "Request removed." };
  });

export const updateProfileFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "You must be logged in." };

    const userId = formData.get("userId") as string;
    const currentUserData = await getUserByUserId(userId);

    if (!currentUserData)
      return { success: false, message: "Profile does not exist." };

    if (currentUserData.id !== session.user.id) {
      return {
        success: false,
        message:
          "Unable to edit. You can only make changes to your own profile.",
      };
    }

    const newFullName = formData.get("name") as string;
    const newSchoolName = formData.get("schoolName") as string | null;
    const attachment = formData.get("attachment");
    const currentPassword = formData.get("currentPassword") as string | null;
    const newPassword = formData.get("newPassword") as string | null;
    const confirmNewPassword = formData.get("confirmNewPassword") as
      | string
      | null;

    if (newPassword && newPassword !== confirmNewPassword) {
      return {
        success: false,
        message:
          "Passwords do not match. Please ensure both password fields are identical.",
      };
    }

    const account = pickPasswordAccount(
      await getAccountsByUserId(currentUserData.id),
    );
    if (!account) {
      return {
        success: false,
        message:
          "Account not found. Please ensure you're logged in with a valid account.",
      };
    }

    const hasAttachment =
      attachment instanceof File &&
      attachment.name !== "undefined" &&
      attachment.size > 0;

    if (hasAttachment && !isAvatarFile(attachment)) {
      return {
        success: false,
        message: "Only image files can be used as a profile photo.",
      };
    }

    if (hasAttachment && isAvatarTooLarge(attachment)) {
      return {
        success: false,
        message: "Profile photo must be 4MB or less.",
      };
    }

    if (
      account.providerId === "credential" &&
      newPassword &&
      !currentPassword
    ) {
      return {
        success: false,
        message: "Current password is required to change your password.",
      };
    }

    const ctx = await auth.$context;
    const newPasswordIsCurrent =
      account.providerId === "credential" && newPassword
        ? await ctx.password.verify({
            password: newPassword,
            hash: account.password ?? "",
          })
        : false;

    const hasChanges =
      currentUserData.name !== newFullName ||
      currentUserData.schoolName !== newSchoolName ||
      (account.providerId === "google" && newPassword) ||
      (account.providerId === "credential" &&
        newPassword &&
        !newPasswordIsCurrent) ||
      hasAttachment;

    if (!hasChanges) {
      return {
        success: true,
        message: "No changes were made to your profile.",
      };
    }

    if (newPassword) {
      if (newPassword.length < 8 || newPassword.length > 20) {
        return {
          success: false,
          message: "Password must be between 8 and 20 characters long.",
        };
      }

      if (account.providerId === "google") {
        const result = await auth.api.setPassword({
          body: { newPassword },
          headers,
        });
        if (!result) {
          return {
            success: false,
            message: "Failed to change password. Please try again later.",
          };
        }
      }

      if (account.providerId === "credential" && currentPassword) {
        try {
          await auth.api.changePassword({
            body: { newPassword, currentPassword, revokeOtherSessions: true },
            headers,
          });
        } catch {
          return {
            success: false,
            message: "Current password is incorrect. Please try again.",
          };
        }
      }
    }

    const newProfilePhoto = hasAttachment
      ? ((await uploadAttachments("avatars", session.user.id, attachment)) ??
        currentUserData.image)
      : currentUserData.image;

    const updatedGuest = {
      name: newFullName,
      email: currentUserData.email,
      image: newProfilePhoto,
      schoolName: newSchoolName,
      updatedAt: new Date(),
    };

    const result = editUserSchema.safeParse(updatedGuest);
    if (result.error) {
      return {
        success: false,
        message: "Invalid profile data.",
      };
    }

    await updateUserRecord(userId, result.data);

    if (
      hasAttachment &&
      newProfilePhoto !== currentUserData.image &&
      isUploadedAvatarUrl(currentUserData.image)
    ) {
      await deleteFileFromBucket(
        "avatars",
        extractAvatarFilePath(currentUserData.image),
      );
    }

    return { success: true, message: "Profile updated!" };
  });

export const createUserFn = createServerFn({ method: "POST" })
  .validator(createUserSchema)
  .handler(async ({ data }): Promise<UserMutationResult> => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role !== "admin")
      return { success: false, message: "Unauthorized" };

    const email = data.email.trim().toLowerCase();

    if (await getUserByEmail(email)) {
      return {
        success: false,
        message: "This email has already been taken.",
        code: "emailTaken",
      };
    }

    const ctx = await auth.$context;

    try {
      const user = await ctx.internalAdapter.createUser(
        { name: data.name, email, emailVerified: true, role: "user" },
        { method: "admin" },
      );

      if (!user)
        return { success: false, message: "User could not be created." };

      try {
        await ctx.internalAdapter.linkAccount({
          providerId: "credential",
          accountId: user.id,
          userId: user.id,
          password: await ctx.password.hash(data.password),
        });
      } catch {
        await deleteUserRecord(user.id);
        return { success: false, message: "User could not be created." };
      }
    } catch {
      return { success: false, message: "User could not be created." };
    }

    return { success: true, message: "User created successfully!" };
  });

export const updateUserFn = createServerFn({ method: "POST" })
  .validator(editUserDetailsSchema)
  .handler(async ({ data }): Promise<UserMutationResult> => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role !== "admin")
      return { success: false, message: "Unauthorized" };

    const currentUserData = await getUserByUserId(data.userId);

    if (!currentUserData)
      return { success: false, message: "User does not exist." };

    if (!userDetailsChanged(currentUserData, data)) {
      return {
        success: true,
        message: "No changes were made to the user profile.",
      };
    }

    const email = data.email.trim().toLowerCase();
    const existing = await getUserByEmail(email);

    if (existing && existing.id !== currentUserData.id) {
      return {
        success: false,
        message: "This email has already been taken.",
        code: "emailTaken",
      };
    }

    const updated = await updateUserRecord(data.userId, {
      name: data.name,
      email,
      updatedAt: new Date(),
    });

    if (!updated)
      return { success: false, message: "User could not be edited." };

    return { success: true, message: "User updated successfully!" };
  });

export const closeAccountFn = createServerFn({ method: "POST" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const user = await getUserByUserId(userId);
    if (!user) return { success: false, message: "User does not exist." };

    if (session.user.id !== user.id && session.user.role !== "admin") {
      return {
        success: false,
        message: "You do not have permission to close this account.",
      };
    }

    if (isUploadedAvatarUrl(user.image)) {
      const filePath = extractAvatarFilePath(user.image);
      await deleteFileFromBucket("avatars", filePath);
    }

    const deleted = await deleteUserCascade(user.id);
    if (!deleted)
      return { success: false, message: "Failed to close account." };

    return { success: true, message: "Account closed successfully." };
  });
