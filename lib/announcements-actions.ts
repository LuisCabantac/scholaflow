"use server";

import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/auth";
import { getPostById } from "@/lib/data-service";
import { arraysAreEqual, extractImagePath, hasUser } from "@/lib/utils";

export interface IImage {
  size: number;
  type: string;
  name: string;
  lastModified: number;
}

export async function uploadImage(file: File) {
  if (file.name !== "undefined") {
    const [name, extension] = file.name.split(/\.(?=[^\.]+$)/);
    const { data: imageData, error } = await supabase.storage
      .from("announcements")
      .upload(`${name}_${uuidv4()}.${extension}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const {
      data: { publicUrl },
    } = supabase.storage.from("announcements").getPublicUrl(imageData.path);
    return publicUrl;
  }
}

export async function deleteFileFromBucket(
  bucketName: string,
  filePath: string[],
) {
  const { error } = await supabase.storage.from(bucketName).remove(filePath);

  if (error)
    throw new Error(
      `${filePath} cannot be deleted from the ${bucketName} bucket`,
    );
}

export async function createPost(formData: FormData) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role !== "admin") {
    return {
      success: false,
      message: "You must be a school admin to create a post.",
    };
  }

  const images = formData.getAll("attachments");
  const postImage = Array.isArray(images)
    ? await Promise.all(
        images.map(async (attachment) => {
          if (attachment instanceof File && attachment.name !== "undefined") {
            return await uploadImage(attachment);
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const newPost = {
    author: session.user.id,
    authorName: session.user.name,
    caption: formData.get("caption"),
    levels: formData.get("levels"),
    image: postImage,
    links: formData.getAll("links"),
  };

  const { error } = await supabase.from("announcements").insert([newPost]);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/user/announcements");

  return { success: true, message: "Your post has been published!" };
}

export async function updatePost(
  currentUrlLinks: string[],
  currentAttachments: string[],
  formData: FormData,
) {
  const session = await auth();
  if (!hasUser(session)) return redirect("/signin");

  const postId = formData.get("postId") as string;

  if (session.user.role !== "admin")
    return {
      success: false,
      message: "You need be an admin to edit this post.",
    };

  const post = await getPostById(postId);

  if (!post)
    return {
      success: false,
      message: "This post does not exist.",
    };

  const { levels, caption, image: existingImages, links: existingLinks } = post;

  const newAttachments = formData.getAll("newAttachments");
  const newUrlLinks = formData.getAll("newUrlLinks");
  const newCaption = formData.get("caption");
  const newLevels = formData.get("levels");

  if (
    caption !== newCaption ||
    levels !== newLevels ||
    newAttachments.length ||
    newUrlLinks.length ||
    arraysAreEqual(currentAttachments, existingImages) === false ||
    arraysAreEqual(currentUrlLinks, existingLinks) === false
  ) {
    const removedAttachments = post.image.filter(
      (attachment) => !currentAttachments.includes(attachment),
    );
    if (removedAttachments.length) {
      const filePath = removedAttachments.map((img: string) =>
        extractImagePath(img),
      );
      await deleteFileFromBucket("announcements", filePath);
    }

    const postImages = Array.isArray(newAttachments)
      ? await Promise.all(
          newAttachments.map(async (attachment) => {
            if (
              attachment instanceof File &&
              attachment.name !== "undefined" &&
              attachment.size > 0
            ) {
              return await uploadImage(attachment);
            } else {
              return null;
            }
          }),
        ).then((results) => results.filter((url) => url !== null))
      : [];

    const updatePost = {
      caption: formData.get("caption") as string,
      levels: formData.get("levels") as string,
      image: postImages.concat(currentAttachments),
      links: newUrlLinks.concat(currentUrlLinks),
      updatedPost: true,
    };

    const { error } = await supabase
      .from("announcements")
      .update(updatePost)
      .eq("id", postId);

    if (error) return { success: false, message: error.message };

    revalidatePath(`/user/announcements/edit/${postId}`);
    revalidatePath("/user/announcements");
    return { success: true, message: "Post updated successfully!" };
  }

  return {
    success: true,
    message: "No changes were made to the post.",
  };
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role !== "admin")
    throw new Error("You need be an admin to delete this post.");

  const post = await getPostById(postId);

  if (!post)
    return {
      success: false,
      message: "This post does not exist.",
    };

  const { image } = post;

  if (image.length) {
    const filePath = image.map((img: string) => extractImagePath(img));
    await deleteFileFromBucket("announcements", filePath);
  }

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", postId);

  if (error) throw new Error(error.message);
}
