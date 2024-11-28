"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { extractAvatarFilePath, hasUser } from "@/lib/utils";
import {
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
  getAllNotesBySession,
  getUserByEmail,
  getUserByUserId,
} from "@/lib/data-service";
import {
  deleteAllMessagesByUserId,
  deleteClass,
  deleteEnrolledClassbyClassAndEnrolledClassId,
  uploadAttachments,
} from "@/lib/classroom-actions";
import { deleteNote } from "@/lib/notes-actions";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createUser(newGuest: object): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth();
  if (!hasUser(session))
    return { success: false, message: "You must be logged in." };

  if (session.user.role !== "admin")
    return {
      success: false,
      message: "You need be an admin to edit this post.",
    };

  const { error } = await supabase.from("users").insert([newGuest]);

  if (error) {
    return { success: false, message: "User could not be created" };
  }
  revalidatePath("/user/admin/user-management");
  return { success: true, message: "User created successfully!" };
}

export async function updateUser(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth();
  if (!hasUser(session))
    return { success: false, message: "You must be logged in." };

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
  const newPassword = formData.get("password");
  const newFullName = formData.get("fullName");
  const newUserRole = formData.get("userRole");

  if (
    currentUserData.email !== newEmail ||
    currentUserData.fullName !== newFullName ||
    currentUserData.password !== newPassword ||
    currentUserData.role !== newUserRole
  ) {
    const updatedGuest = {
      fullName: newFullName,
      email: newEmail,
      password: newPassword,
      role: newUserRole,
    };

    const { error } = await supabase
      .from("users")
      .update([updatedGuest])
      .eq("id", userId);

    if (error) {
      return { success: false, message: "User could not be edited." };
    }
    revalidatePath("/user/admin/user-management");
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
  const session = await auth();
  if (!hasUser(session))
    return { success: false, message: "You must be logged in." };

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
    currentUserData.fullName !== newFullName ||
    currentUserData.password !== newPassword ||
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

    if (
      currentUserData.password !== newPassword &&
      (newPassword as string).length < 8
    )
      return {
        success: false,
        message: "Your password must be a minimum of 8 characters in length.",
      };

    const newProfilePhoto = attachment
      ? await uploadAttachments("avatars", session.user.id, attachment as File)
      : currentUserData.avatar;

    if (
      attachment &&
      !currentUserData.avatar.startsWith("https://lh3.googleusercontent.com/")
    ) {
      const filePath = extractAvatarFilePath(currentUserData.avatar);
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
      .from("users")
      .update([updatedGuest])
      .eq("id", userId);

    if (error) {
      return { success: false, message: "Profile could not be edited." };
    }
    revalidatePath("/user/profile");
    return { success: true, message: "Profile updated!" };
  }

  return {
    success: true,
    message: `No changes were made to your profile.`,
  };
}

export async function deleteUser(userId: string): Promise<void> {
  const session = await auth();
  if (!hasUser(session)) throw new Error("You must be logged in.");

  if (!(session.user.role === "admin" || session.user.id === userId))
    throw new Error("You need be an admin to delete this user.");

  const user = await getUserByUserId(userId);
  if (!user) throw new Error("User does not exist.");

  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) throw new Error(error.message);
}

export async function closeAccount(userId: string): Promise<void> {
  const session = await auth();
  if (!hasUser(session)) throw new Error("You must be logged in.");

  const user = await getUserByUserId(userId);
  if (!user) throw new Error("User does not exist.");

  await deleteAllMessagesByUserId(userId);

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

  if (!user.avatar.startsWith("https://lh3.googleusercontent.com/")) {
    const filePath = extractAvatarFilePath(user.avatar);
    await deleteFileFromBucket("avatars", filePath);
  }

  await deleteUser(user.id);

  return redirect("/");
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
