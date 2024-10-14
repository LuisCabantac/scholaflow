"use server";

import { redirect } from "next/navigation";
import { auth, ISchool } from "./auth";
import { getPostById, getSchool } from "./data-service";
import { supabase } from "./supabase";
import { revalidatePath } from "next/cache";
import { extractImagePath, hasUser } from "./utils";

export interface IImage {
  size: number;
  type: string;
  name: string;
  lastModified: number;
}

export async function uploadImage(image: File, school: string) {
  if (image.name !== "undefined") {
    const { data: imageData, error } = await supabase.storage
      .from("images")
      .upload(`${Date.now()}_${school.split(" ").join("_")}`, image, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(imageData.path);
    return data;
  }
}

export async function deleteImage(bucket: string, fileName: string) {
  const { error } = await supabase.storage.from(bucket).remove([fileName]);

  if (error)
    throw new Error(`${fileName} cannot be deleted from the ${bucket} bucket`);
}

export async function createPost(formData: FormData) {
  const session = await auth();

  if (!hasUser(session)) {
    throw new Error("You must be logged in to create a post");
  }

  if (session.user.role === "student" || session.user.role === "teacher") {
    throw new Error("You must be a school admin to create a post");
  }

  const school = await getSchool(session.user.school);

  const image = formData.get("image");
  const postImage =
    image instanceof File
      ? await uploadImage(image, session.user.schoolName ?? "")
      : null;

  const newPost = {
    author: session.user.id,
    authorName: session.user.name,
    school: session.user.school,
    schoolName: session.user.schoolName,
    schoolAvatar: (school as ISchool[])[0].schoolLogo,
    title: formData.get("title"),
    description: formData.get("description"),
    levels: formData.get("levels"),
    image: postImage?.publicUrl,
  };

  const { error } = await supabase.from("announcements").insert([newPost]);

  if (error) {
    throw new Error("Post could not be created");
  }

  revalidatePath("/user/announcements");

  redirect("/user/announcements");
}

export async function updatePost(formData: FormData) {
  const id = formData.get("id") as string;

  const session = await auth();
  if (!hasUser(session)) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("You need be an admin to edit this post.");

  const { title, levels, description, school } = await getPostById(id);
  if (session.user.school !== school)
    throw new Error(
      "You need be an admin of this school to be able to edit this post.",
    );

  const updatePost = {
    title: formData.get("title") as string,
    levels: formData.get("levels") as string,
    description: formData.get("description") as string,
    updatedPost: true,
  };

  if (
    title !== updatePost.title ||
    levels !== updatePost.levels ||
    description !== updatePost.description
  ) {
    const { error } = await supabase
      .from("announcements")
      .update(updatePost)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
  }

  revalidatePath(`/user/announcements/edit/${id}`);
  revalidatePath("/user/announcements");

  redirect("/user/announcements");
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!hasUser(session)) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("You need be an admin to delete this post.");

  const { school, image } = await getPostById(postId);
  if (session.user.school !== school)
    throw new Error(
      "You need be an admin of this school to be able to delete this post.",
    );

  if (image !== null) {
    const path = extractImagePath(image);
    await deleteImage("images", path);
  }

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", postId);

  if (error) throw new Error(error.message);
}
