"use server";

import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/auth";
import { getPostById } from "@/lib/data-service";
import { extractImagePath, hasUser } from "@/lib/utils";

export interface IImage {
  size: number;
  type: string;
  name: string;
  lastModified: number;
}

export async function uploadImage(image: File) {
  if (image.name !== "undefined") {
    const fileExtension = image.name.split(".").pop();

    const { data: imageData, error } = await supabase.storage
      .from("images")
      .upload(`${Date.now()}.${fileExtension}`, image, {
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

export async function deleteImage(bucket: string, fileName: string[]) {
  const { error } = await supabase.storage.from(bucket).remove(fileName);

  if (error)
    throw new Error(`${fileName} cannot be deleted from the ${bucket} bucket`);
}

export async function createPost(formData: FormData) {
  const session = await auth();

  if (!hasUser(session)) {
    return {
      success: false,
      message: "You must be logged in to create a post.",
    };
  }

  if (session.user.role !== "admin") {
    return {
      success: false,
      message: "You must be a school admin to create a post.",
    };
  }

  const image = formData.getAll("image");
  const postImage = Array.isArray(image)
    ? await Promise.all(
        image.map(async (img) => {
          if (
            img instanceof File &&
            img.name !== "undefined" &&
            img.size > 0 &&
            (img.type.includes("image/jpeg") ||
              img.type.includes("image/jpg") ||
              img.type.includes("image/png"))
          ) {
            return await uploadImage(img);
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const newPost = {
    author: session.user.id,
    authorName: session.user.name,
    title: formData.get("title"),
    description: formData.get("description"),
    levels: formData.get("levels"),
    image: postImage?.map((img) => img?.publicUrl),
  };

  const { error } = await supabase.from("announcements").insert([newPost]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/user/announcements");

  return { success: true, message: "Your post has been published!" };
}

export async function updatePost(formData: FormData) {
  const id = formData.get("id") as string;

  const session = await auth();
  if (!hasUser(session))
    return { success: false, message: "You must be logged in." };

  if (session.user.role !== "admin")
    return {
      success: false,
      message: "You need be an admin to edit this post.",
    };

  const {
    title,
    levels,
    description,
    image: existingImages,
  } = await getPostById(id);

  const image = formData.getAll("image");

  const postImage = Array.isArray(image)
    ? await Promise.all(
        image.map(async (img) => {
          if (img instanceof File && img.name !== "undefined" && img.size > 0) {
            return await uploadImage(img);
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const updatePost = {
    title: formData.get("title") as string,
    levels: formData.get("levels") as string,
    description: formData.get("description") as string,
    image:
      postImage.length > 0
        ? existingImages.concat(postImage?.map((img) => img?.publicUrl))
        : existingImages,
    updatedPost: true,
  };

  if (
    title !== updatePost.title ||
    levels !== updatePost.levels ||
    description !== updatePost.description ||
    postImage.length > 0
  ) {
    const { error } = await supabase
      .from("announcements")
      .update(updatePost)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, message: error.message };

    revalidatePath(`/user/announcements/edit/${id}`);
    revalidatePath("/user/announcements");
    return { success: true, message: "Post updated successfully!" };
  }

  return {
    success: true,
    message: "No changes detected, post remains the same.",
  };
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!hasUser(session)) throw new Error("You must be logged in.");

  if (session.user.role !== "admin")
    throw new Error("You need be an admin to delete this post.");

  const { image } = await getPostById(postId);

  if (image.length) {
    const path = image.map((img: string) => extractImagePath(img));
    await deleteImage("images", path);
  }

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", postId);

  if (error) throw new Error(error.message);
}
