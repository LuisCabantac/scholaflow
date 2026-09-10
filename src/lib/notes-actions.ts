"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { note } from "@/drizzle/schema";
import { getNoteByNoteIdSession } from "@/lib/notes-service";
import { createNoteSchema, editNoteSchema } from "@/lib/schema";
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
    userId: session.user.id,
    title: formData.get("title"),
    content: formData.get("description"),
    attachments: noteAttachments,
    isPinned,
    updatedAt: null,
  };

  const result = createNoteSchema.safeParse(newNote);

  if (result.error)
    return {
      success: false,
      message: "Failed to create note. Please try again.",
    };

  await db.insert(note).values(result.data);

  revalidatePath(`/notes`);

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

  if (currentNote.userId !== session.user.id)
    return {
      success: false,
      message: "Only the author who created this note can edit this.",
    };

  const newTitle = formData.get("title") as string;
  const newDescription = formData.get("description") as string;
  const newNoteAttachments = formData.getAll("attachments");

  if (
    newTitle !== currentNote.title ||
    newDescription !== currentNote.content ||
    isPinned !== currentNote.isPinned ||
    newNoteAttachments.length ||
    arraysAreEqual(curAttachments, currentNote.attachments ?? []) === false
  ) {
    const removedAttachments = currentNote.attachments.filter(
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
      content: formData.get("description"),
      attachments: noteAttachments.concat(curAttachments),
      isPinned,
      updatedAt: new Date(),
    };

    const result = editNoteSchema.safeParse(updatedNote);

    if (result.error) {
      return {
        success: false,
        message: "Failed to edit note. Please try again.",
      };
    }

    await db.update(note).set(result.data).where(eq(note.id, noteId));

    revalidatePath(`/notes`);

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

  const currentNote = await getNoteByNoteIdSession(noteId);

  if (!currentNote) throw new Error("Note doesn't exist.");

  if (currentNote.attachments.length) {
    const noteAttachmentsFilePath = currentNote.attachments.map((file) =>
      extractNoteFilePath(file),
    );
    await deleteFilesFromBucket("notes", noteAttachmentsFilePath);
  }

  await db.delete(note).where(eq(note.id, noteId));

  revalidatePath(`/notes`);
}
