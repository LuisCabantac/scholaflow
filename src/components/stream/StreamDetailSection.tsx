import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouter } from "@tanstack/react-router";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { streamKeys } from "@/queries/stream";
import type { SessionUser } from "@/types/auth";
import { classworkKeys } from "@/queries/classwork";
import { commentKeys, commentQueries } from "@/queries/comment";
import { deleteClassStreamFn } from "@/server/functions/stream";
import {
  addCommentToStreamFn,
  deleteStreamCommentFn,
} from "@/server/functions/comment";
import type {
  Classroom,
  ClassTopic,
  Classwork,
  EnrolledClass,
  Stream,
} from "@/lib/schema";

import StreamForm from "@/components/stream/StreamForm";
import CommentCard from "@/components/stream/CommentCard";
import CommentForm from "@/components/stream/CommentForm";
import LinkifiedText from "@/components/stream/LinkifiedText";
import StreamUserWork from "@/components/stream/StreamUserWork";
import CommentsLoading from "@/components/shared/CommentsLoading";
import EllipsisPopover from "@/components/shared/EllipsisPopover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfirmationModal from "@/components/shared/ConfirmationModal";
import AttachmentFileCard from "@/components/shared/AttachmentFileCard";
import AttachmentLinkCard from "@/components/shared/AttachmentLinkCard";
import StreamDetailHeader from "@/components/stream/StreamDetailHeader";

const loadingRows = ["one", "two", "three", "four", "five", "six"];

export default function StreamDetailSection({
  stream,
  classroom,
  user,
  topics,
  enrolledClasses,
  classwork,
}: {
  stream: Stream;
  classroom: Classroom;
  user: SessionUser;
  topics: ClassTopic[] | null;
  enrolledClasses: EnrolledClass[] | null;
  classwork: Classwork | null;
}) {
  const { t } = useTranslation("stream", { keyPrefix: "detail" });
  const { t: tCard } = useTranslation("stream", { keyPrefix: "card" });
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showStreamForm, setShowStreamForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isTeacher = user.id === classroom.teacherId;
  const canManage = user.id === stream.userId || isTeacher;
  const canComment = classroom.allowUsersToComment || isTeacher;
  const isClasswork = stream.type !== "stream" && stream.type !== "material";
  const inAudience =
    (stream.announceTo.includes(user.id) && !stream.announceToAll) ||
    stream.announceToAll;
  const clipboardUrl = `/classroom/class/${classroom.id}/stream/${stream.id}`;

  const { data: comments, isPending: commentsIsPending } = useSuspenseQuery(
    commentQueries.byStream(stream.id),
  );

  const deleteStream = useMutation({
    mutationFn: async () => {
      const result = await deleteClassStreamFn({
        data: { classroomId: classroom.id, streamId: stream.id },
      });
      if (!result.success) throw new Error(result.message);
    },
    onSuccess: () => {
      toast.success(tCard("messages.postDeleted"));
      router.history.back();
      queryClient.invalidateQueries({ queryKey: streamKeys.all });
      queryClient.invalidateQueries({ queryKey: classworkKeys.all });
    },
    onError: (error) => toast.error(error.message),
  });

  const addComment = useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await addCommentToStreamFn({ data: formData });
      if (!result.success) throw new Error(result.message);
    },
    onSuccess: () => {
      toast.success(tCard("messages.commentAdded"));
      queryClient.invalidateQueries({
        queryKey: commentKeys.byStream(stream.id),
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
      const result = await deleteStreamCommentFn({ data: variables });
      if (!result.success) throw new Error(result.message);
    },
    onMutate: async ({ commentId }) => {
      const key = commentKeys.byStream(stream.id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (current: typeof comments) =>
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
        queryKey: commentKeys.byStream(stream.id),
      }),
  });

  return (
    <section className="flex items-start gap-2">
      <div className="flex w-full flex-col items-start gap-2">
        {isTeacher && isClasswork && (
          <Tabs defaultValue="instructions">
            <TabsList>
              <TabsTrigger value="instructions" asChild>
                <Link
                  to="/classroom/class/$classId/stream/$streamId"
                  params={{ classId: stream.classId, streamId: stream.id }}
                >
                  {t("instructions")}
                </Link>
              </TabsTrigger>
              <TabsTrigger value="submissions" asChild>
                <Link
                  to="/classroom/class/$classId/stream/$streamId/submissions"
                  params={{ classId: stream.classId, streamId: stream.id }}
                >
                  {t("submissions")}
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <div className={`relative w-full ${isTeacher ? "" : "pb-[12rem]"}`}>
          <div className="flex items-center gap-2">
            <Link
              to="/classroom/class/$classId"
              params={{ classId: classroom.id }}
              aria-label={t("back")}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                />
              </svg>
            </Link>
          </div>
          <div>
            <div className="mt-2">
              <StreamDetailHeader stream={stream} />
              {stream.content && (
                <LinkifiedText>
                  <p className="overflow-wrap mb-2 break-words whitespace-pre-line">
                    {stream.content}
                  </p>
                </LinkifiedText>
              )}
              {stream.attachments.length || stream.links.length ? (
                <div className="mb-2">
                  <ul className="grid gap-1 font-medium">
                    {stream.attachments.map((file, index) => (
                      <AttachmentFileCard
                        file={file}
                        index={index}
                        type="curFile"
                        location="stream"
                        key={file}
                      />
                    ))}
                    {stream.links.map((url, index) => (
                      <AttachmentLinkCard
                        key={url}
                        link={url}
                        index={index}
                        location="stream"
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <ul className="grid gap-2">
              {canComment || commentsIsPending || comments?.length ? (
                <li className="border-t pt-2 text-sm font-medium">
                  {t("comments")}
                </li>
              ) : null}
              {canComment && (
                <li>
                  <CommentForm
                    fields={{ classroomId: classroom.id, streamId: stream.id }}
                    isPending={addComment.isPending}
                    placeholder={tCard("addComment")}
                    pendingPlaceholder={tCard("addingComment")}
                    onSubmit={(formData) => addComment.mutate(formData)}
                  />
                </li>
              )}
              {commentsIsPending &&
                loadingRows.map((row) => <CommentsLoading key={row} />)}
              {!commentsIsPending &&
                comments?.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    stream={stream}
                    classroom={classroom}
                    user={user}
                    comment={comment}
                    deleteCommentIsPending={deleteComment.isPending}
                    onDeleteComment={(classroomId, streamId, commentId) =>
                      deleteComment.mutate({ classroomId, streamId, commentId })
                    }
                  />
                ))}
            </ul>
          </div>
          <div className="absolute top-0 right-0">
            <div className="relative">
              <EllipsisPopover
                showEdit={canManage}
                showDelete={canManage}
                clipboardUrl={clipboardUrl}
                onShowEditForm={() => setShowStreamForm(true)}
                onShowConfirmationModal={() => setShowConfirmation(true)}
              >
                <button type="button" aria-label={t("menu")}>
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                    />
                  </svg>
                </button>
              </EllipsisPopover>
              {showConfirmation && (
                <ConfirmationModal
                  type="delete"
                  btnLabel={tCard("delete")}
                  isLoading={deleteStream.isPending}
                  handleCancel={() => setShowConfirmation(false)}
                  handleAction={() => {
                    setShowConfirmation(false);
                    deleteStream.mutate();
                  }}
                >
                  {tCard("confirmDelete")}
                </ConfirmationModal>
              )}
            </div>
          </div>
          {showStreamForm && (
            <StreamForm
              formType="edit"
              streamType={stream.type}
              stream={stream}
              topics={topics}
              classroom={classroom}
              enrolledClasses={enrolledClasses}
              user={user}
              onClose={() => setShowStreamForm(false)}
            />
          )}
        </div>
      </div>
      {!isTeacher && inAudience && isClasswork && (
        <StreamUserWork
          stream={stream}
          classroom={classroom}
          user={user}
          classwork={classwork}
        />
      )}
    </section>
  );
}
