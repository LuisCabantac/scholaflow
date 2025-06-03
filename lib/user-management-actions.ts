"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { extractAvatarFilePath } from "@/lib/utils";
import {
  getAllClassesByTeacherId,
  getAllClassesStreamByUserId,
  getAllEnrolledClassesByUserId,
  getAllNotesBySession,
  getRoleRequest,
  getUserByEmail,
  getUserByUserId,
} from "@/lib/data-service";
import {
  deleteAllCommentsByUserId,
  deleteAllMessagesByUserId,
  deleteAllPrivateCommentsByUserId,
  deleteClass,
  deleteClassStreamPost,
  deleteEnrolledClassbyClassAndEnrolledClassId,
  uploadAttachments,
} from "@/lib/classroom-actions";
import { deleteNote } from "@/lib/notes-actions";

import { IRoleRequest } from "@/components/RoleRequestDialog";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const newEmail = formData.get("email") as string;
  const newPassword = formData.get("password");
  const newFullName = formData.get("fullName");
  const newSchoolName = formData.get("schoolName");
  const attachment = formData.get("attachment");

  if (
    currentUserData.email !== newEmail ||
    currentUserData.name !== newFullName ||
    // currentUserData.password !== newPassword ||
    currentUserData.schoolName !== newSchoolName ||
    attachment
  ) {
    if (!emailRegex.test(newEmail))
      return {
        success: false,
        message: "Invalid email address.",
      };

    const emailExist = await getUserByEmail(newEmail);

    if (currentUserData.email !== newEmail && emailExist)
      return {
        success: false,
        message: "Email address already in use.",
      };

    // if (
    //   currentUserData.password !== newPassword &&
    //   (newPassword as string).length < 8
    // )
    //   return {
    //     success: false,
    //     message: "Your password must be a minimum of 8 characters in length.",
    //   };

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
      fullName: newFullName,
      email: newEmail,
      password: newPassword,
      schoolName: newSchoolName,
      avatar: newProfilePhoto,
    };

    const { error } = await supabase
      .from("user")
      .update([updatedGuest])
      .eq("id", userId);

    if (error) {
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
        enrolledClass.classroomId,
      );
    }
  }

  const createdClasses = await getAllClassesByTeacherId(userId);
  if (createdClasses?.length) {
    for (const createdClass of createdClasses) {
      await deleteClass(createdClass.classroomId);
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
    avatar: formData.get("avatar"),
  };

  const { error } = await supabase.from("roleRequests").insert([request]);

  if (error) {
    return { success: false, message: "Request could not be created." };
  }
  revalidatePath("/profile");
  return {
    success: true,
    message:
      "Your request to become a Teacher has been submitted. The status of your request will be updated here.",
  };
}

export async function approveRoleRequest(request: IRoleRequest): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("Only an admin can perform this action.");

  const userRequest = await getRoleRequest(request.userId);

  if (!userRequest) throw new Error("Request does not exist.");

  await setTeacherUserRole(request.userId);

  const { error } = await supabase
    .from("roleRequests")
    .delete()
    .eq("userId", request.userId)
    .eq("id", request.id);

  if (error) throw new Error(error.message);
}

export async function rejectRoleRequest(request: IRoleRequest): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("Only an admin can perform this action.");

  const userRequest = await getRoleRequest(request.userId);

  if (!userRequest) throw new Error("Request does not exist.");

  const rejectedRequest = {
    status: "rejected",
  };

  const { error } = await supabase
    .from("roleRequests")
    .update([rejectedRequest])
    .eq("userId", request.userId)
    .eq("id", request.id);

  if (error) throw new Error(error.message);
}

export async function removeRoleRequest(request: IRoleRequest): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("Only an admin can perform this action.");

  const userRequest = await getRoleRequest(request.userId);

  if (!userRequest) throw new Error("Request does not exist.");

  const { error } = await supabase
    .from("roleRequests")
    .delete()
    .eq("userId", request.userId)
    .eq("id", request.id);

  if (error) throw new Error(error.message);
}

async function removeRoleRequestByUserId(userId: string): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  const userRequest = await getRoleRequest(userId);

  if (!userRequest) return;

  const { error } = await supabase
    .from("roleRequests")
    .delete()
    .eq("userId", userId);

  if (error) throw new Error(error.message);
}

async function setTeacherUserRole(userId: string): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("Only an admin can perform this action.");

  const updatedUserRole = { role: "teacher" };

  const { error } = await supabase
    .from("user")
    .update([updatedUserRole])
    .eq("id", userId);

  if (error) throw new Error(error.message);
}
