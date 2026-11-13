import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import { uploadableFiles } from "@/lib/attachments";
import { streamForViewer } from "@/server/authorize/stream";
import { visiblePrivateComments } from "@/server/authorize/comment";
import {
  getAllCommentsByStreamId,
  getAllPrivateCommentsByStreamId,
} from "@/services/comment";
import {
  addCommentFlow,
  addPrivateCommentFlow,
  deleteCommentFlow,
  deletePrivateCommentFlow,
} from "@/services/comment-flows";

export const getAllCommentsByStreamIdFn = createServerFn({ method: "GET" })
  .validator((streamId: string) => streamId)
  .handler(async ({ data: streamId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const outcome = await streamForViewer(session.user.id, streamId);
    if (!outcome.ok) return null;

    return await getAllCommentsByStreamId(streamId);
  });

export const getAllPrivateCommentsByStreamIdFn = createServerFn({
  method: "GET",
})
  .validator((streamId: string) => streamId)
  .handler(async ({ data: streamId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const outcome = await streamForViewer(session.user.id, streamId);
    if (!outcome.ok) return null;

    const { classroom } = outcome.value;
    const comments = await getAllPrivateCommentsByStreamId(streamId);
    if (classroom.teacherId === session.user.id) return comments;

    return comments
      ? visiblePrivateComments(comments, session.user.id, classroom.teacherId)
      : null;
  });

function formRef(formData: FormData) {
  return {
    classId: formData.get("classroomId") as string,
    streamId: formData.get("streamId") as string,
  };
}

function formComment(formData: FormData) {
  return {
    content: (formData.get("comment") as string | null) || null,
    file: uploadableFiles(formData.getAll("attachment"))[0] ?? null,
  };
}

export const addCommentToStreamFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const outcome = await addCommentFlow(
      session.user,
      formRef(formData),
      formComment(formData),
    );
    if (!outcome.ok) return { success: false, message: outcome.message };

    return { success: true, message: "Comment added successfully!" };
  });

export const deleteStreamCommentFn = createServerFn({ method: "POST" })
  .validator(
    (data: { classroomId: string; streamId: string; commentId: string }) =>
      data,
  )
  .handler(async ({ data: { classroomId, streamId, commentId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const outcome = await deleteCommentFlow(
      session.user,
      { classId: classroomId, streamId },
      commentId,
    );
    if (!outcome.ok) return { success: false, message: outcome.message };

    return { success: true, message: "Comment deleted successfully." };
  });

export const addPrivateCommentFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const outcome = await addPrivateCommentFlow(
      session.user,
      formRef(formData),
      {
        ...formComment(formData),
        recipientId: (formData.get("userId") as string | null) || null,
      },
    );
    if (!outcome.ok) return { success: false, message: outcome.message };

    return { success: true, message: "Private comment added successfully!" };
  });

export const deletePrivateCommentFn = createServerFn({ method: "POST" })
  .validator(
    (data: { classroomId: string; streamId: string; commentId: string }) =>
      data,
  )
  .handler(async ({ data: { classroomId, streamId, commentId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const outcome = await deletePrivateCommentFlow(
      session.user,
      { classId: classroomId, streamId },
      commentId,
    );
    if (!outcome.ok) return { success: false, message: outcome.message };

    return {
      success: true,
      message: "Private comment deleted successfully.",
    };
  });
