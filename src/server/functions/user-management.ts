import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { extractAvatarFilePath } from "@/lib/utils";
import { uploadAttachments } from "@/services/storage";
import { deleteAllMessagesByUserId } from "@/services/message";
import { deleteNote, getAllNotesByUserId } from "@/services/notes";
import { createRoleRequestSchema, editUserSchema } from "@/lib/schema";
import { deleteAllNotificationsByUserId } from "@/services/notification";
import {
  deleteClassStreamPost,
  getAllClassesStreamByUserId,
} from "@/services/stream";
import {
  deleteAllCommentsByUserId,
  deleteAllPrivateCommentsByUserId,
} from "@/services/comment";
import {
  deleteClass,
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
  deleteEnrolledClassbyClassAndEnrolledClassId,
} from "@/services/classroom";
import {
  getUserByEmail,
  getUserByUserId,
  createUserRecord,
  updateUserRecord,
  deleteUserRecord,
  getAccountByUserId,
} from "@/services/user";
import {
  getRoleRequest,
  getAllRoleRequests,
  deleteFileFromBucket,
  createRoleRequestRecord,
  deleteRoleRequestRecord,
  updateRoleRequestRecord,
  removeRoleRequestByUserId,
} from "@/services/user-management";

export const getRoleRequestFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getRoleRequest(userId);
  });

export const getAllRoleRequestsFn = createServerFn({ method: "GET" })
  .validator((status: "pending" | "rejected") => status)
  .handler(async ({ data: status }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role !== "admin") return null;

    return await getAllRoleRequests(status);
  });

export const requestTeacherRoleFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "You must be logged in." };

    const userId = formData.get("userId") as string;
    const userData = await getUserByUserId(userId);

    if (!userData) return { success: false, message: "User does not exist." };
    if (userData.role === "admin")
      return { success: false, message: "Admin users do not need requests." };

    const existingRequest = await getRoleRequest(userId);
    if (existingRequest) {
      return {
        success: false,
        message: "Request already submitted. Please wait.",
      };
    }

    const request = {
      userId,
      userName: (formData.get("userName") as string) || "",
      userEmail: (formData.get("userEmail") as string) || "",
      userImage: (formData.get("avatar") as string) || "",
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

    await updateUserRecord(userId, { role: "admin" });
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

    const newEmail = formData.get("email") as string;
    const newFullName = formData.get("name") as string;
    const newSchoolName = formData.get("schoolName") as string | null;
    const attachment = formData.get("attachment");
    const currentPassword = formData.get("currentPassword") as string | null;
    const newPassword = formData.get("newPassword") as string | null;
    const confirmNewPassword = formData.get("confirmNewPassword") as
      string | null;

    if (newPassword && newPassword !== confirmNewPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    const account = await getAccountByUserId(currentUserData.id);
    if (!account) return { success: false, message: "Account not found." };

    const ctx = await auth.$context;
    const isPassingCredentialCheck =
      account.providerId === "credential" && currentPassword && newPassword
        ? await ctx.password.verify({
            password: currentPassword,
            hash: account.password ?? "",
          })
        : true;

    if (
      currentUserData.email !== newEmail ||
      currentUserData.name !== newFullName ||
      currentUserData.schoolName !== newSchoolName ||
      (account.providerId === "google" && newPassword) ||
      (account.providerId === "credential" &&
        currentPassword &&
        newPassword &&
        !isPassingCredentialCheck) ||
      (attachment &&
        attachment instanceof File &&
        attachment.name !== "undefined" &&
        attachment.size > 0)
    ) {
      if (currentUserData.email !== newEmail) {
        const emailExist = await getUserByEmail(newEmail);
        if (emailExist)
          return { success: false, message: "Email address already in use." };
      }

      let newProfilePhoto = currentUserData.image;
      if (
        attachment &&
        attachment instanceof File &&
        attachment.name !== "undefined" &&
        attachment.size > 0
      ) {
        newProfilePhoto =
          (await uploadAttachments("avatars", session.user.id, attachment)) ??
          currentUserData.image;

        if (
          !currentUserData.image.startsWith(
            "https://lh3.googleusercontent.com/",
          )
        ) {
          const filePath = extractAvatarFilePath(currentUserData.image);
          await deleteFileFromBucket("avatars", filePath);
        }
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
          if (!result)
            return { success: false, message: "Failed to change password." };
        }

        if (account.providerId === "credential") {
          if (!currentPassword)
            return { success: false, message: "Current password is required." };
          try {
            await auth.api.changePassword({
              body: { newPassword, currentPassword, revokeOtherSessions: true },
              headers,
            });
          } catch {
            return {
              success: false,
              message: "Current password may be incorrect or failed to change.",
            };
          }
        }
      }

      const updatedGuest = {
        name: newFullName,
        email: newEmail,
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

      return { success: true, message: "Profile updated!" };
    }

    return { success: true, message: "No changes were made to your profile." };
  });

export const createUserFn = createServerFn({ method: "POST" })
  .validator((data: any) => data)
  .handler(async ({ data: newGuest }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role !== "admin")
      return { success: false, message: "Unauthorized" };

    const data = await createUserRecord(newGuest);
    if (!data) return { success: false, message: "User could not be created" };

    return { success: true, message: "User created successfully!" };
  });

export const updateUserFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.role !== "admin")
      return { success: false, message: "Unauthorized" };

    const userId = formData.get("userId") as string;
    const currentUserData = await getUserByUserId(userId);

    if (!currentUserData)
      return { success: false, message: "User does not exist." };

    const newEmail = formData.get("email") as string;
    const newFullName = formData.get("fullName") as string;
    const newUserRole = formData.get("userRole") as string;

    if (
      currentUserData.email !== newEmail ||
      currentUserData.name !== newFullName ||
      currentUserData.role !== newUserRole
    ) {
      const data = await updateUserRecord(userId, {
        name: newFullName,
        email: newEmail,
        role: newUserRole as any,
      });

      if (!data) return { success: false, message: "Failed to update user." };

      return { success: true, message: "User updated successfully!" };
    }

    return { success: true, message: "No changes were made." };
  });

export const deleteUserFn = createServerFn({ method: "POST" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };
    if (session.user.role !== "admin" && session.user.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await getUserByUserId(userId);
    if (!user) return { success: false, message: "User does not exist." };

    await deleteUserRecord(userId);
    return { success: true, message: "User deleted successfully." };
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

    await deleteAllMessagesByUserId(userId);
    await deleteAllCommentsByUserId(userId);
    await deleteAllPrivateCommentsByUserId(userId);

    const posts = await getAllClassesStreamByUserId(userId);
    if (posts?.length) {
      for (const post of posts) {
        await deleteClassStreamPost(post.id);
      }
    }

    const enrolledClasses = await getAllEnrolledClassesByUserId(userId);
    if (enrolledClasses?.length) {
      for (const enrolledClass of enrolledClasses) {
        await deleteEnrolledClassbyClassAndEnrolledClassId(
          enrolledClass.id,
          enrolledClass.classId,
        );
      }
    }

    const createdClasses = await getAllClassesByTeacherId(userId);
    if (createdClasses?.length) {
      for (const createdClass of createdClasses) {
        await deleteClass(createdClass.id);
      }
    }

    const allNotes = await getAllNotesByUserId(userId);
    if (allNotes?.length) {
      for (const note of allNotes) {
        await deleteNote(note.id);
      }
    }

    await deleteAllNotificationsByUserId(userId);
    await removeRoleRequestByUserId(userId);

    if (
      user.image &&
      !user.image.startsWith("https://lh3.googleusercontent.com/")
    ) {
      const filePath = extractAvatarFilePath(user.image);
      await deleteFileFromBucket("avatars", filePath);
    }

    await deleteUserRecord(user.id);

    return { success: true, message: "Account closed successfully." };
  });
