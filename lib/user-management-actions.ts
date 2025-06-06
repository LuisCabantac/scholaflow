"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { extractAvatarFilePath } from "@/lib/utils";
import {
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
} from "@/lib/classroom-service";
import { db } from "@/drizzle";
import { deleteNote } from "@/lib/notes-actions";
import { getAllNotesBySession } from "@/lib/notes-service";
import { getRoleRequest } from "@/lib/user-management-service";
import { getAllClassesStreamByUserId } from "@/lib/stream-service";
import { getUserByEmail, getUserByUserId } from "@/lib/user-service";
import { roleRequest as roleRequestDrizzle, user } from "@/drizzle/schema";
import {
  createRoleRequestSchema,
  editUserSchema,
  RoleRequest,
} from "@/lib/schema";
import {
  deleteAllCommentsByUserId,
  deleteAllMessagesByUserId,
  deleteAllPrivateCommentsByUserId,
  deleteClass,
  deleteClassStreamPost,
  deleteEnrolledClassbyClassAndEnrolledClassId,
  uploadAttachments,
} from "@/lib/classroom-actions";

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createUser(newGuest: object): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return { success: false, message: "You must be logged in." };

  if (session.user.role !== "admin")
    return {
      success: false,
      message: "You need be an admin to edit this post.",
    };

  const { error } = await supabase.from("user").insert([newGuest]);

  if (error) {
    return { success: false, message: "User could not be created" };
  }
  revalidatePath("/admin/user-management");
  return { success: true, message: "User created successfully!" };
}

export async function updateUser(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return { success: false, message: "You must be logged in." };

  if (session.user.role !== "admin")
    return {
      success: false,
      message: "You need be an admin to edit this post.",
    };

  const userId = formData.get("userId") as string;

  const currentUserData = await getUserByUserId(userId);

  if (!currentUserData)
    return { success: false, message: "User does not exist." };

  const newEmail = formData.get("email");
  // const newPassword = formData.get("password");
  const newFullName = formData.get("fullName");
  const newUserRole = formData.get("userRole");

  if (
    currentUserData.email !== newEmail ||
    currentUserData.name !== newFullName ||
    // currentUserData.password !== newPassword ||
    currentUserData.role !== newUserRole
  ) {
    const updatedGuest = {
      fullName: newFullName,
      email: newEmail,
      // password: newPassword,
      role: newUserRole,
    };

    const { error } = await supabase
      .from("user")
      .update([updatedGuest])
      .eq("id", userId);

    if (error) {
      return { success: false, message: "User could not be edited." };
    }
    revalidatePath("/admin/user-management");
    return { success: true, message: "User created successfully!" };
  }

  return {
    success: true,
    message: `No changes were made to the user profile.`,
  };
}

export async function updateProfile(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return { success: false, message: "You must be logged in." };

  const userId = formData.get("userId") as string;

  const currentUserData = await getUserByUserId(userId);

  if (!currentUserData)
    return { success: false, message: "Profile does not exist." };

  if (currentUserData.id !== session.user.id)
    return {
      success: false,
      message: "Unable to edit. You can only make changes to your own profile.",
    };

  const newEmail = formData.get("email");
  const newFullName = formData.get("name");
  const newSchoolName = formData.get("schoolName");
  const attachment = formData.get("attachment");

  console.log(newEmail);

  if (
    currentUserData.email !== newEmail ||
    currentUserData.name !== newFullName ||
    currentUserData.schoolName !== newSchoolName ||
    attachment
  ) {
    // if (!emailRegex.test(newEmail))
    //   return {
    //     success: false,
    //     message: "Invalid email address.",
    //   };

    const emailExist = await getUserByEmail(newEmail as string);

    if (currentUserData.email !== newEmail && emailExist)
      return {
        success: false,
        message: "Email address already in use.",
      };

    const newProfilePhoto = attachment
      ? await uploadAttachments("avatars", session.user.id, attachment as File)
      : currentUserData.image;

    if (
      attachment &&
      !currentUserData.image.startsWith("https://lh3.googleusercontent.com/")
    ) {
      const filePath = extractAvatarFilePath(currentUserData.image);
      await deleteFileFromBucket("avatars", filePath);
    }

    const updatedGuest = {
      name: newFullName,
      email: newEmail,
      image: newProfilePhoto,
      schoolName: newSchoolName,
      updatedAt: new Date(),
    };

    const result = editUserSchema.safeParse(updatedGuest);

    if (result.error)
      return {
        success: false,
        message: "Invalid profile data. Please check all fields and try again.",
      };

    const [data] = await db
      .update(user)
      .set(result.data)
      .where(eq(user.id, userId))
      .returning();

    if (!data) {
      return { success: false, message: "Profile could not be edited." };
    }

    revalidatePath("/profile");

    return { success: true, message: "Profile updated!" };
  }

  return {
    success: true,
    message: `No changes were made to your profile.`,
  };
}

export async function deleteUser(userId: string): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  if (!(session.user.role === "admin" || session.user.id === userId))
    throw new Error("You need be an admin to delete this user.");

  const user = await getUserByUserId(userId);
  if (!user) throw new Error("User does not exist.");

  const { error } = await supabase.from("user").delete().eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function closeAccount(userId: string): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  const user = await getUserByUserId(userId);
  if (!user) throw new Error("User does not exist.");

  if (!(session.user.id === user.id || session.user.role === "admin"))
    throw new Error("You do not have permission to close this account.");

  await deleteAllMessagesByUserId(userId);

  await deleteAllCommentsByUserId(userId);

  await deleteAllPrivateCommentsByUserId(userId);

  const posts = await getAllClassesStreamByUserId(session.user.id);
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

  const allNotes = await getAllNotesBySession();
  if (allNotes?.length) {
    for (const note of allNotes) {
      await deleteNote(note.id);
    }
  }

  await removeRoleRequestByUserId(userId);

  if (!user.image.startsWith("https://lh3.googleusercontent.com/")) {
    const filePath = extractAvatarFilePath(user.image);
    await deleteFileFromBucket("avatars", filePath);
  }

  await deleteUser(user.id);

  return;
}

export async function deleteFileFromBucket(
  bucketName: string,
  filePath: string,
) {
  const { error } = await supabase.storage.from(bucketName).remove([filePath]);

  if (error)
    throw new Error(
      `${filePath} cannot be deleted from the ${bucketName} bucket`,
    );
}

export async function roleRequest(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return { success: false, message: "You must be logged in." };

  const userId = formData.get("userId") as string;

  const userData = await getUserByUserId(userId);
  if (!userData) return { success: false, message: "User does not exist." };

  if (userData.role === "teacher")
    return { success: false, message: "You are already a teacher." };

  const existingRequest = await getRoleRequest(userId);

  if (existingRequest)
    return {
      success: false,
      message:
        "Request already submitted. Please wait for it to be approved or denied.",
    };

  const request = {
    userId: formData.get("userId"),
    userName: formData.get("userName"),
    userEmail: formData.get("userEmail"),
    userImage: formData.get("avatar"),
    status: "pending",
  };

  const result = createRoleRequestSchema.safeParse(request);

  if (result.error)
    return {
      success: false,
      message: "Invalid request data. Please check all fields and try again.",
    };

  const [data] = await db
    .insert(roleRequestDrizzle)
    .values(result.data)
    .returning();

  if (!data) {
    return {
      success: false,
      message: "Failed to submit your teacher role request. Please try again.",
    };
  }

  revalidatePath("/profile");

  return {
    success: true,
    message:
      "Your request to become a Teacher has been submitted. The status of your request will be updated here.",
  };
}

export async function approveRoleRequest(request: RoleRequest): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("Only an admin can perform this action.");

  const userRequest = await getRoleRequest(request.userId);

  if (!userRequest) throw new Error("Request does not exist.");

  await setTeacherUserRole(request.userId);

  const [data] = await db
    .delete(roleRequestDrizzle)
    .where(
      and(
        eq(roleRequestDrizzle.userId, request.userId),
        eq(roleRequestDrizzle.id, request.id),
      ),
    )
    .returning();

  if (!data) throw new Error("Failed to delete role request from database.");
}

export async function rejectRoleRequest(request: RoleRequest): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("Only an admin can perform this action.");

  const userRequest = await getRoleRequest(request.userId);

  if (!userRequest) throw new Error("Request does not exist.");

  const [data] = await db
    .update(roleRequestDrizzle)
    .set({ status: "rejected" })
    .where(
      and(
        eq(roleRequestDrizzle.userId, request.userId),
        eq(roleRequestDrizzle.id, request.id),
      ),
    )
    .returning();

  if (!data) throw new Error("Failed to reject role request in database.");
}

export async function removeRoleRequest(request: RoleRequest): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("Only an admin can perform this action.");

  const userRequest = await getRoleRequest(request.userId);

  if (!userRequest) throw new Error("Request does not exist.");

  const [data] = await db
    .delete(roleRequestDrizzle)
    .where(
      and(
        eq(roleRequestDrizzle.userId, request.userId),
        eq(roleRequestDrizzle.id, request.id),
      ),
    )
    .returning();

  if (!data) throw new Error("Failed to delete role request from database.");
}

async function removeRoleRequestByUserId(userId: string): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  const userRequest = await getRoleRequest(userId);

  if (!userRequest) return;

  const [data] = await db
    .delete(roleRequestDrizzle)
    .where(eq(roleRequestDrizzle.userId, userId))
    .returning();

  if (!data)
    throw new Error("Failed to delete this user's role request from database.");
}

async function setTeacherUserRole(userId: string): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("Only an admin can perform this action.");

  const [data] = await db
    .update(user)
    .set({ role: "teacher" })
    .where(eq(user.id, userId))
    .returning();

  if (!data) throw new Error("Failed to set this user's role to teacher.");
}
