"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { hasUser } from "@/lib/utils";

export async function createGuestUser(newGuest: object) {
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

export async function deleteUser(userId: string) {
  const session = await auth();
  if (!hasUser(session)) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("You need be an admin to delete this user.");

  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) throw new Error(error.message);
}
// export async function updatePost(formData: FormData) {
//   const id = formData.get("id") as string;

//   const session = await auth();
//   if (!hasUser(session))
//     return { success: false, message: "You must be logged in." };

//   if (session.user.role !== "admin")
//     return {
//       success: false,
//       message: "You need be an admin to edit this post.",
//     };

//   const { title, levels, description } = await getPostById(id);

//   const updatePost = {
//     title: formData.get("title") as string,
//     levels: formData.get("levels") as string,
//     description: formData.get("description") as string,
//     updatedPost: true,
//   };

//   if (
//     title !== updatePost.title ||
//     levels !== updatePost.levels ||
//     description !== updatePost.description
//   ) {
//     const { error } = await supabase
//       .from("announcements")
//       .update(updatePost)
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) return { success: false, message: error.message };

//     revalidatePath(`/user/announcements/edit/${id}`);
//     revalidatePath("/user/announcements");
//     return { success: true, message: "Post updated successfully!" };
//   }

//   return {
//     success: true,
//     message: "No changes detected, post remains the same.",
//   };
// }
