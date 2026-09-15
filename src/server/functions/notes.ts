import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { uploadAttachments } from "@/services/storage";
import { deleteFilesFromBucket } from "@/services/user-management";
import { createNoteSchema, editNoteSchema } from "@/lib/schema";
import { arraysAreEqual, extractNoteFilePath } from "@/lib/utils";
import {
  createNote,
  updateNote,
  deleteNote,
  getAllNotesByUserId,
  getAllNotesByUserIdQuery,
  getNoteByNoteIdAndUserId,
} from "@/services/notes";

export const getAllNotesSessionFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllNotesByUserId(session.user.id);
  },
);

export const getNoteByNoteIdSessionFn = createServerFn({ method: "GET" })
  .validator((noteId: string) => noteId)
  .handler(async ({ data: noteId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getNoteByNoteIdAndUserId(noteId, session.user.id);
  });

export const getAllNotesBySessionQueryFn = createServerFn({ method: "GET" })
  .validator((query: string) => query)
  .handler(async ({ data: query }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    return await getAllNotesByUserIdQuery(session.user.id, query);
  });

export const createNoteFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const isPinned = formData.get("isPinned") === "true";
    const attachments = formData.getAll("attachments");

    const noteAttachments = Array.isArray(attachments)
      ? await Promise.all(
          attachments.map(async (attachment) => {
            if (
              attachment instanceof File &&
              attachment.name !== "undefined" &&
              attachment.size > 0
            ) {
              return await uploadAttachments(
                "notes",
                session.user.id,
                attachment,
              );
            }
            return null;
          }),
        ).then((results) =>
          results.filter((url): url is string => url !== null),
        )
      : [];

    const newNote = {
      userId: session.user.id,
      title: (formData.get("title") as string | null) || null,
      content: (formData.get("description") as string | null) || null,
      attachments: noteAttachments,
      isPinned,
      updatedAt: null,
    };

    const result = createNoteSchema.safeParse(newNote);
    if (result.error) {
      return {
        success: false,
        message: "Failed to create note. Please try again.",
      };
    }

    const data = await createNote(result.data);
    if (!data) return { success: false, message: "Failed to save note." };

    return { success: true, message: "Your new note has been saved." };
  });

export const updateNoteFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const noteId = formData.get("noteId") as string;
    const isPinned = formData.get("isPinned") === "true";

    let curAttachments = formData.getAll("curAttachments") as string[];
    if (curAttachments.length === 1 && curAttachments[0].startsWith("[")) {
      try {
        curAttachments = JSON.parse(curAttachments[0]);
      } catch {
        curAttachments = [];
      }
    }

    const currentNote = await getNoteByNoteIdAndUserId(noteId, session.user.id);

    if (!currentNote) return { success: false, message: "Note doesn't exist." };
    if (currentNote.userId !== session.user.id)
      return { success: false, message: "Only the author can edit this." };

    const newTitle = formData.get("title") as string;
    const newDescription = formData.get("description") as string;
    const newNoteAttachments = formData.getAll("attachments");

    if (
      newTitle !== currentNote.title ||
      newDescription !== currentNote.content ||
      isPinned !== currentNote.isPinned ||
      newNoteAttachments.length > 0 ||
      arraysAreEqual(curAttachments, currentNote.attachments ?? []) === false
    ) {
      const removedAttachments = (currentNote.attachments || []).filter(
        (attachment) => !curAttachments.includes(attachment),
      );

      if (removedAttachments.length) {
        const filePaths = removedAttachments.map((file) =>
          extractNoteFilePath(file),
        );
        await deleteFilesFromBucket("notes", filePaths);
      }

      const noteAttachments = Array.isArray(newNoteAttachments)
        ? await Promise.all(
            newNoteAttachments.map(async (attachment) => {
              if (
                attachment instanceof File &&
                attachment.name !== "undefined" &&
                attachment.size > 0
              ) {
                return await uploadAttachments(
                  "notes",
                  session.user.id,
                  attachment,
                );
              }
              return null;
            }),
          ).then((results) =>
            results.filter((url): url is string => url !== null),
          )
        : [];

      const updatedNote = {
        title: newTitle,
        content: newDescription,
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

      const data = await updateNote(noteId, result.data);
      if (!data) return { success: false, message: "Failed to update note." };

      return { success: true, message: "Changes saved." };
    }
    return { success: true, message: "No changes were made." };
  });

export const deleteNoteFn = createServerFn({ method: "POST" })
  .validator((noteId: string) => noteId)
  .handler(async ({ data: noteId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized." };

    const currentNote = await getNoteByNoteIdAndUserId(noteId, session.user.id);
    if (!currentNote) return { success: false, message: "Note doesn't exist." };

    if (currentNote.attachments && currentNote.attachments.length) {
      const filePaths = currentNote.attachments.map((file) =>
        extractNoteFilePath(file),
      );
      await deleteFilesFromBucket("notes", filePaths);
    }

    const data = await deleteNote(noteId);
    if (!data) return { success: false, message: "Failed to delete note." };

    return { success: true, message: "Note deleted." };
  });
