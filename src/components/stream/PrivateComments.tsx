import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SessionUser } from "@/types/auth";
import { privateThread } from "@/lib/classwork-rules";
import type { Classroom, Stream } from "@/lib/schema";
import { commentKeys, commentQueries } from "@/queries/comment";
import {
  addPrivateCommentFn,
  deletePrivateCommentFn,
} from "@/server/functions/comment";

import CommentCard from "@/components/stream/CommentCard";
import CommentForm from "@/components/stream/CommentForm";
import CommentsLoading from "@/components/shared/CommentsLoading";

const loadingRows = ["one", "two", "three", "four", "five", "six"];

export default function PrivateComments({
  stream,
  classroom,
  user,
  otherUserId,
  classworkId,
  variant = "work",
}: {
  stream: Stream;
  classroom: Classroom;
  user: SessionUser;
  otherUserId: string;
  classworkId?: string;
  variant?: "work" | "submissions";
}) {
  const { t } = useTranslation("stream", { keyPrefix: "work" });
  const { t: tCard } = useTranslation("stream", { keyPrefix: "card" });
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const comments = useQuery(commentQueries.privateByStream(stream.id));
  const thread = privateThread(comments.data, user.id, otherUserId);

  const addComment = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await addPrivateCommentFn({ data: formData });
      if (!result.success) throw new Error(result.message);
    },
    onSuccess: () => {
      toast.success(tCard("messages.commentAdded"));
      queryClient.invalidateQueries({
        queryKey: commentKeys.privateByStream(stream.id),
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteComment = useMutation({
    mutationFn: async (variables: {
      classroomId: string;
      streamId: string;
      commentId: string;
    }) => {
      const result = await deletePrivateCommentFn({ data: variables });
      if (!result.success) throw new Error(result.message);
    },
    onMutate: async ({ commentId }) => {
      const key = commentKeys.privateByStream(stream.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (current: typeof comments.data) =>
        current?.filter((comment) => comment.id !== commentId),
      );
      return { key, previous };
    },
    onError: (error, _variables, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success(tCard("messages.commentDeleted")),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: commentKeys.privateByStream(stream.id),
      }),
  });

  const fields = {
    classroomId: stream.classId,
    classworkId: classworkId ?? "",
    userId: otherUserId,
    streamId: stream.id,
  };

  const list = (className: string) => (
    <ul className={className}>
      {comments.isPending &&
        loadingRows.map((row) => <CommentsLoading key={row} />)}
      {!comments.isPending &&
        thread.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            stream={stream}
            user={user}
            classroom={classroom}
            deleteCommentIsPending={deleteComment.isPending}
            onDeleteComment={(classroomId, streamId, commentId) =>
              deleteComment.mutate({ classroomId, streamId, commentId })
            }
          />
        ))}
    </ul>
  );

  const form = (
    <CommentForm
      fields={fields}
      isPending={addComment.isPending}
      placeholder={t("addPrivateComment")}
      pendingPlaceholder={tCard("addingComment")}
      onSubmit={(formData) => addComment.mutate(formData)}
    />
  );
  const toggle = (className: string) =>
    thread.length ? (
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className={className}
      >
        {expanded ? t("minimizeComments") : t("expandComments")}
      </button>
    ) : null;

  if (variant === "submissions") {
    return (
      <>
        <div className="bg-card hidden flex-col md:flex">
          <div>
            <div className="mt-2 border-t pt-2">
              <p className="font-medium">{t("privateComments")}</p>
              <div className="bg-card w-full py-2">{form}</div>
              {thread.length || comments.isPending
                ? list("mt-2 grid max-h-[20rem] gap-2 overflow-y-auto")
                : null}
            </div>
          </div>
        </div>
        <div className="bg-card fixed right-0 bottom-0 left-0 flex flex-col md:static md:hidden">
          <div>
            <div className="flex-end flex flex-col gap-2 border-t px-3 pt-2 md:mt-2 md:px-0">
              <div className="flex items-center justify-between">
                <p className="font-medium">{t("privateComments")}</p>
                {toggle("text-primary block text-xs md:hidden")}
              </div>
              {thread.length || comments.isPending
                ? list(
                    `grid gap-2 ${expanded ? "max-h-[15rem] overflow-y-auto" : "max-h-0"}`,
                  )
                : null}
            </div>
          </div>
          <div className="bg-card z-10 w-full px-3 pt-1 pb-3 md:px-0 md:pb-0">
            {form}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="z-10 block md:hidden">
        <div>
          <div className="flex-end flex flex-col">
            <div
              className={`flex items-center justify-between ${expanded ? "mb-2" : ""}`}
            >
              <span className="text-sm font-medium">
                {t("privateComments")}
              </span>
              {toggle("text-primary block text-sm md:hidden")}
            </div>
            {thread.length || comments.isPending
              ? list(
                  `grid gap-2 overflow-y-auto md:max-h-[15rem] ${expanded ? "max-h-[15rem]" : "h-0"}`,
                )
              : null}
          </div>
        </div>
        <div className="mt-1 w-full">{form}</div>
      </div>
      <div className="hidden md:block">
        <span className="text-sm font-medium">{t("privateComments")}</span>
        <div className="mt-1">{form}</div>
        {thread.length || comments.isPending
          ? list("mt-2 grid max-h-[20rem] gap-2 overflow-y-auto")
          : null}
      </div>
    </>
  );
}
