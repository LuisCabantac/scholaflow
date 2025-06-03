"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getNoteByNoteIdSession } from "@/lib/data-service";
import { arraysAreEqual, extractNoteFilePath } from "@/lib/utils";
import {
  deleteFilesFromBucket,
  uploadAttachments,
} from "@/lib/classroom-actions";

export async function createNote(
  isPinned: boolean,
  formData: FormData,
): Promise<{
  success: boolean;
  message: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const attachments = formData.getAll("attachments");
  const noteAttachments = Array.isArray(attachments)
    ? await Promise.all(
        attachments.map(async (attachment) => {
          if (attachment instanceof File && attachment.name !== "undefined") {
            return await uploadAttachments(
              "notes",
              session.user.id,
              attachment,
            );
          } else {
            return null;
          }
        }),
      ).then((results) => results.filter((url) => url !== null))
    : [];

  const newNote = {
    author: session.user.id,
    title: formData.get("title"),
    description: formData.get("description"),
    attachment: noteAttachments,
    isPinned,
  };

  const { error } = await supabase.from("notes").insert([newNote]);

  if (error) {
    return {
      success: false,
      message: "Failed to create note. Please try again.",
    };
  }

  revalidatePath(`/user/notes`);

  return {
    success: true,
    message: "Your new note has been saved.",
  };
}

export async function updateNote(
  isPinned: boolean,
  curAttachments: string[],
  formData: FormData,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const noteId = formData.get("noteId") as string;

  const currentNote = await getNoteByNoteIdSession(noteId);

  if (!currentNote)
    return {
      success: false,
      message: "Note doesn't exist.",
    };

  if (currentNote.author !== session.user.id)
    return {
      success: false,
      message: "Only the author who created this note can edit this.",
    };

  const newTitle = formData.get("title") as string;
  const newDescription = formData.get("description") as string;
  const newNoteAttachments = formData.getAll("attachments");

  if (
    newTitle !== currentNote.title ||
    newDescription !== currentNote.description ||
    isPinned !== currentNote.isPinned ||
    newNoteAttachments.length ||
    arraysAreEqual(curAttachments, currentNote.attachment) === false
  ) {
    const removedAttachments = currentNote.attachment.filter(
      (attachment) => !curAttachments.includes(attachment),
    );

    if (removedAttachments.length) {
      const filePath = removedAttachments.map((file) =>
        extractNoteFilePath(file),
      );
      await deleteFilesFromBucket("notes", filePath);
    }

    const noteAttachments = Array.isArray(newNoteAttachments)
      ? await Promise.all(
          newNoteAttachments.map(async (attachment) => {
            if (attachment instanceof File && attachment.name !== "undefined") {
              return await uploadAttachments(
                "notes",
                session.user.id,
                attachment,
              );
            } else {
              return null;
            }
          }),
        ).then((results) => results.filter((url) => url !== null))
      : [];

    const updatedNote = {
      title: formData.get("title"),
      description: formData.get("description"),
      attachment: noteAttachments.concat(curAttachments),
      isPinned,
    };

    const { error } = await supabase
      .from("notes")
      .update([updatedNote])
      .eq("id", noteId);

    if (error) {
      return {
        success: false,
        message: "Failed to edit note. Please try again.",
      };
    }

    revalidatePath(`/user/notes`);

    return {
      success: true,
      message: "Changes saved.",
    };
  }
  return {
    success: true,
    message: "No changes were made.",
  };
}

export async function deleteNote(noteId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const note = await getNoteByNoteIdSession(noteId);

  if (!note) throw new Error("Note doesn't exist.");

  if (note.attachment.length) {
    const noteAttachmentsFilePath = note.attachment.map((file) =>
      extractNoteFilePath(file),
    );
    await deleteFilesFromBucket("notes", noteAttachmentsFilePath);
  }

  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  revalidatePath(`/user/notes`);

  if (error) throw new Error(error.message);
}
