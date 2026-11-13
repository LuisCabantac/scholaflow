import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ImagePlus, SendHorizontal } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SessionUser } from "@/types/auth";
import { commentKeys, commentQueries } from "@/queries/comment";
import type { Classroom, Stream, StreamComment } from "@/lib/schema";
import {
  addCommentToStreamFn,
  deleteStreamCommentFn,
} from "@/server/functions/comment";

import CommentCard from "@/components/stream/CommentCard";
import ZoomedImage from "@/components/stream/ZoomedImage";
import CommentsLoading from "@/components/shared/CommentsLoading";
import { TextareaAutosize } from "@/components/ui/textarea-autosize";

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const loadingRows = ["one", "two", "three", "four", "five", "six"];

export default function StreamComments({
  stream,
  classroom,
  user,
  onHasComments,
}: {
  stream: Stream;
  classroom: Classroom;
  user: SessionUser;
  onHasComments: (hasComments: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("stream", { keyPrefix: "card" });

  const [showClassComments, setShowClassComments] = useState(false);
  const [streamComment, setStreamComment] = useState("");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [attachmentImage, setAttachmentImage] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null,
  );

  const comments = useQuery(commentQueries.byStream(stream.id));

  const addComment = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await addCommentToStreamFn({ data: formData });
      if (!result.success) throw new Error(result.message);
    },
    onSuccess: () => {
      toast.success(t("messages.commentAdded"));
      queryClient.invalidateQueries({
        queryKey: commentKeys.byStream(stream.id),
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteComment = useMutation({
    mutationFn: async (vars: {
      classroomId: string;
      streamId: string;
      commentId: string;
    }) => {
      const result = await deleteStreamCommentFn({ data: vars });
      if (!result.success) throw new Error(result.message);
    },
    onMutate: async ({ commentId }) => {
      const key = commentKeys.byStream(stream.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<StreamComment[] | null>(key);
      queryClient.setQueryData<StreamComment[] | null>(key, (old) =>
        old ? old.filter((c) => c.id !== commentId) : old,
      );
      return { previous, key };
    },
    onError: (error, _vars, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success(t("messages.commentDeleted")),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: commentKeys.byStream(stream.id),
      }),
  });

  const hasComments = !!comments.data?.length;

  useEffect(() => {
    onHasComments(hasComments);
  }, [hasComments, onHasComments]);

  const canComment =
    classroom.allowUsersToComment || classroom.teacherId === user.id;

  function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (attachmentImage) formData.append("attachment", attachmentImage);
    addComment.mutate(formData);
    setStreamComment("");
    setAttachmentImage(null);
    setAttachmentPreview(null);
  }

  function handlePickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error(t("messages.attachmentTooLarge"));
      return;
    }
    setAttachmentImage(file);
    setAttachmentPreview(URL.createObjectURL(file));
  }

  function toggleComments() {
    setShowClassComments((current) => !current);
  }

  return (
    <>
      <div>
        {(hasComments || showClassComments) && (
          <>
            <Link
              to="/classroom/class/$classId/stream/$streamId"
              params={{ classId: classroom.id, streamId: stream.id }}
              className="mt-2 block font-medium md:hidden"
            >
              {t("viewAllComments")}
            </Link>
            <button
              type="button"
              onClick={toggleComments}
              className={`${showClassComments ? "mb-2" : ""} mt-2 hidden font-medium md:block`}
            >
              {showClassComments ? t("hideAllComments") : t("viewAllComments")}
            </button>
          </>
        )}
        <ul className="hidden max-h-[20rem] gap-2 overflow-y-auto md:grid">
          {showClassComments && (
            <>
              {comments.isPending &&
                loadingRows.map((row) => <CommentsLoading key={row} />)}
              {!comments.isPending &&
                comments.data?.map((comment) => {
                  return (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      stream={stream}
                      user={user}
                      classroom={classroom}
                      deleteCommentIsPending={deleteComment.isPending}
                      onDeleteComment={(classroomId, streamId, commentId) =>
                        deleteComment.mutate({
                          classroomId,
                          streamId,
                          commentId,
                        })
                      }
                    />
                  );
                })}
            </>
          )}
        </ul>
      </div>
      {canComment && (
        <>
          <Link
            to="/classroom/class/$classId/stream/$streamId"
            params={{ classId: classroom.id, streamId: stream.id }}
            className="mt-2 flex items-end gap-2 md:hidden"
          >
            <div className="bg-foreground/10 text-muted-foreground flex h-9 w-full items-center justify-between rounded-xl border px-4 py-2">
              <span>{t("addComment")}</span>
            </div>
            <div className="flex items-center gap-4 py-2">
              <ImagePlus className="stroke-foreground/90 size-5" />
              <SendHorizontal className="stroke-primary size-6" />
            </div>
          </Link>
          <div className="mt-2 hidden md:block">
            <form
              className={`flex w-full ${streamComment.length > 50 ? "items-end" : "items-center"}`}
              onSubmit={handleCommentSubmit}
            >
              <input
                type="text"
                name="classroomId"
                defaultValue={classroom.id}
                hidden
              />
              <input
                type="text"
                name="streamId"
                defaultValue={stream.id}
                hidden
              />
              <TextareaAutosize
                required={!attachmentPreview}
                disabled={addComment.isPending}
                name="comment"
                className="resize-none"
                minRows={1}
                maxRows={6}
                value={streamComment}
                onChange={(event) => setStreamComment(event.target.value)}
                placeholder={
                  addComment.isPending ? t("addingComment") : t("addComment")
                }
              />
              {!attachmentImage && !addComment.isPending && (
                <label className="px-4 py-2">
                  <span className="sr-only">{t("attachImage")}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    disabled={addComment.isPending}
                    onChange={handlePickImage}
                  />
                  <ImagePlus className="stroke-foreground/90 size-5" />
                </label>
              )}
              <button
                type="submit"
                className={`py-2 ${attachmentImage || addComment.isPending ? "pl-2" : ""}`}
                disabled={addComment.isPending}
                aria-label={t("send")}
              >
                {addComment.isPending ? (
                  <div className="spinner__mini dark" />
                ) : (
                  <SendHorizontal className="stroke-primary size-6" />
                )}
              </button>
            </form>
            {attachmentPreview ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setZoomedImage(attachmentPreview)}
                >
                  <img
                    src={attachmentPreview}
                    alt={t("commentAttachmentAlt")}
                    width={150}
                    height={150}
                    className="mt-2 rounded-xl"
                    onDragStart={(e) => e.preventDefault()}
                  />
                </button>
                <button
                  type="button"
                  className="absolute top-1 left-1 rounded-full bg-black/70 p-1"
                  aria-label={t("removeImage")}
                  onClick={() => {
                    setAttachmentImage(null);
                    setAttachmentPreview(null);
                  }}
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-5 stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : null}
          </div>
        </>
      )}
      {zoomedImage && (
        <ZoomedImage src={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </>
  );
}
