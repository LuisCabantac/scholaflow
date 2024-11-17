"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { hasUser } from "@/lib/utils";
import { getUserByUserId } from "./data-service";

export async function createUser(newGuest: object) {
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

export async function updateUser(formData: FormData) {
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

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!hasUser(session)) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("You need be an admin to delete this user.");

  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) throw new Error(error.message);
}
