import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import type { StreamType } from "@/lib/schema";
import { capitalizeFirstLetter } from "@/lib/utils";
import { uploadableFiles } from "@/lib/attachments";
import { readStreamFormFields } from "@/lib/stream-form";
import {
  streamForViewer,
  visibleClassStreams,
} from "@/server/authorize/stream";
import {
  createStreamFlow,
  deleteStreamFlow,
  updateStreamFlow,
} from "@/services/stream-flows";
import {
  getAllClassStreamsByClassId,
  getAllClassworkStreamsByClassId,
  getAllEnrolledClassesClassworks,
  getClassworksByClassIdQuery,
} from "@/services/stream";

export const getAllClassStreamsByClassIdFn = createServerFn({ method: "GET" })
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const outcome = await visibleClassStreams(
      session.user.id,
      classId,
      getAllClassStreamsByClassId,
    );
    return outcome.ok ? outcome.value : null;
  });

export const getClassStreamByStreamIdFn = createServerFn({ method: "GET" })
  .validator((streamId: string) => streamId)
  .handler(async ({ data: streamId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const outcome = await streamForViewer(session.user.id, streamId);
    return outcome.ok ? outcome.value.stream : null;
  });

export const getAllClassworkStreamsByClassIdFn = createServerFn({
  method: "GET",
})
  .validator((classId: string) => classId)
  .handler(async ({ data: classId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const outcome = await visibleClassStreams(
      session.user.id,
      classId,
      getAllClassworkStreamsByClassId,
    );
    return outcome.ok ? outcome.value : null;
  });

export const getAllEnrolledClassesClassworksFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session) return null;

  return await getAllEnrolledClassesClassworks(session.user.id);
});

export const getClassworksByClassIdQueryFn = createServerFn({ method: "GET" })
  .validator((data: { classId: string; query: string }) => data)
  .handler(async ({ data: { classId, query } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return null;

    const outcome = await visibleClassStreams(session.user.id, classId, (id) =>
      getClassworksByClassIdQuery(id, query),
    );
    return outcome.ok ? outcome.value : null;
  });

function streamLabel(type: StreamType, capitalized: boolean): string {
  const label = type === "stream" ? "post" : type;
  return capitalized ? capitalizeFirstLetter(label) : label;
}

export const createStreamFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const {
      classroomId,
      streamId,
      currentLinks,
      currentAttachments,
      ...input
    } = readStreamFormFields(formData);
    const outcome = await createStreamFlow(session.user, classroomId, {
      ...input,
      files: uploadableFiles(formData.getAll("attachments")),
    });
    if (!outcome.ok) return { success: false, message: outcome.message };

    return {
      success: true,
      message: `${streamLabel(input.type, true)} published!`,
    };
  });

export const updateStreamFn = createServerFn({ method: "POST" })
  .validator((data: FormData) => data)
  .handler(async ({ data: formData }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const { classroomId, streamId, type, ...patch } =
      readStreamFormFields(formData);
    const outcome = await updateStreamFlow(
      session.user,
      { classId: classroomId, streamId: streamId ?? "" },
      { ...patch, files: uploadableFiles(formData.getAll("attachments")) },
    );
    if (!outcome.ok) return { success: false, message: outcome.message };

    const { stream, changed } = outcome.value;
    if (!changed) {
      return {
        success: true,
        message: `No changes were made to the ${streamLabel(stream.type, false)}.`,
      };
    }

    return {
      success: true,
      message: `${streamLabel(stream.type, true)} updated successfully!`,
    };
  });

export const deleteClassStreamFn = createServerFn({ method: "POST" })
  .validator((data: { classroomId: string; streamId: string }) => data)
  .handler(async ({ data: { classroomId, streamId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return { success: false, message: "Unauthorized" };

    const outcome = await deleteStreamFlow(session.user, {
      classId: classroomId,
      streamId,
    });
    if (!outcome.ok) return { success: false, message: outcome.message };

    return { success: true, message: "Post deleted successfully." };
  });
