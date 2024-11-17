"use client";

import { useOptimistic, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, isThisYear, isToday, isYesterday } from "date-fns";
import Linkify from "react-linkify";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ISession } from "@/lib/auth";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import {
  addCommentToStream,
  deleteClassStreamPost,
  deleteStreamComment,
} from "@/lib/classroom-actions";
import {
  IStream,
  IStreamComment,
} from "@/app/user/classroom/class/[classId]/page";
import { IClasswork } from "@/app/user/classroom/class/[classId]/classwork/page";

import { IClass } from "@/components/ClassroomSection";
import StreamCommentCard from "@/components/StreamCommentCard";
import AttachmentLinkCard from "@/components/AttachmentLinkCard";
import AttachmentFileCard from "@/components/AttachmentFileCard";
import EllipsisPopover from "@/components/EllipsisPopover";
import ConfirmationScreen from "@/components/ConfirmationScreen";
import StreamForm from "@/components/StreamForm";
import StreamDetailsUserWork from "@/components/StreamDetailsUserWork";

export default function StreamDetailSection({
  stream,
  session,
  classroom,
  classwork,
  enrolledClasses,
  onGetAllComments,
  onGetAllPrivateComments,
}: {
  stream: IStream;
  session: ISession;
  classroom: IClass;
  classwork: IClasswork | null;
  enrolledClasses: IClass[] | null;
  onGetAllComments: (classId: string) => Promise<IStreamComment[] | null>;
  onGetAllPrivateComments: (
    streamId: string,
  ) => Promise<IStreamComment[] | null>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [streamComment, setStreamComment] = useState("");
  const { useClickOutsideHandler } = useClickOutside();
  const [ellipsis, setEllipsis] = useState(false);
  const [showStreamConfirmation, setShowStreamConfirmation] = useState(false);
  const ellipsisWrapperRef = useRef<HTMLDivElement>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { mutate: deleteStreamPost, isPending: deleteStreamPostIsPending } =
    useMutation({
      mutationFn: deleteClassStreamPost,
      onSuccess: () => {
        toast.success("Post has been successfully deleted!");
        router.back();
        queryClient.invalidateQueries({
          queryKey: ["streams"],
        });
      },
      onError: (error) => toast.error(error.message),
    });

  const { data: comments } = useQuery({
    queryKey: [`stream-${stream.id}-comments`],
    queryFn: () => onGetAllComments(stream.id),
  });

  const { mutate: addComment, isPending: addCommentIsPending } = useMutation({
    mutationFn: addCommentToStream,
    onSuccess: () => {
      toast.success("Comment has been added!");

      queryClient.invalidateQueries({
        queryKey: [`stream-${stream.id}-comments`],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const { mutate: deleteStreamPostComment, isPending: deleteCommentIsPending } =
    useMutation({
      mutationFn: ({
        classroomId,
        streamId,
        commentId,
      }: {
        classroomId: string;
        streamId: string;
        commentId: string;
      }) => deleteStreamComment(classroomId, streamId, commentId),
      onSuccess: () => {
        toast.success("Comment has been successfully deleted!");

        queryClient.invalidateQueries({
          queryKey: [`stream-${stream.id}-comments`],
        });
      },
      onError: (error) => toast.error(error.message),
    });

  const [optimisticComments, optimisticDeleteComment] = useOptimistic(
    comments,
    (curComment, commentId) => {
      return curComment?.filter((comment) => comment.id !== commentId);
    },
  );

  function handleDeleteComment(
    classroomId: string,
    streamId: string,
    commentId: string,
  ) {
    optimisticDeleteComment(commentId);
    deleteStreamPostComment({ classroomId, streamId, commentId });
  }

  function handleCommentSubmit(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    addComment(formData);
    setStreamComment("");
  }

  function handleToggleEllipsis() {
    setEllipsis(!ellipsis);
  }

  function handleToggleShowStreamConfirmation() {
    setShowStreamConfirmation(!showStreamConfirmation);
  }

  function handleToggleShowEditModal() {
    setShowEditModal(!showEditModal);
  }

  useClickOutsideHandler(
    ellipsisWrapperRef,
    () => {
      setEllipsis(false);
    },
    false,
  );

  function captionLinksDecorator(href: string, text: string, key: number) {
    return (
      <a
        href={href}
        key={key}
        target="_blank"
        rel="noopener noreferrer"
        className="overflow-wrap break-words break-all text-[#5c7cfa] underline"
      >
        {text}
      </a>
    );
  }

  return (
    <section className="flex items-start gap-2">
      <div className="flex w-full flex-col items-start gap-2">
        {session.user.id === classroom.teacherId &&
          stream.type !== "stream" &&
          stream.type !== "material" && (
            <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 text-sm font-medium shadow-sm md:text-base">
              <Link
                href={`/user/classroom/class/${stream.classroomId}/stream/${stream.id}`}
                className="rounded-md bg-[#edf2ff] px-3 py-2 shadow-sm transition-all"
              >
                Instructions
              </Link>

              <Link
                href={`/user/classroom/class/${stream.classroomId}/stream/${stream.id}/submissions/`}
                className="px-3 py-2 text-[#929bb4] transition-all"
              >
                Submissions
              </Link>
            </div>
          )}
        <div
          className={`relative w-full ${session.user.id !== classroom.teacherId && "pb-[12rem]"}`}
        >
          <div className="flex items-center gap-2">
            <Link href={`/user/classroom/class/${classroom.classroomId}`}>
              <svg
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
            <h1 className="text-xl font-medium">
              {stream.type === "stream" && "Announcement"}
              {stream.type === "assignment" && "Assignment"}
              {stream.type === "quiz" && "Quiz"}
              {stream.type === "material" && "Material"}
              {stream.type === "question" && "Question"}
            </h1>
          </div>
          <div>
            <div className="mt-4">
              {stream.type === "stream" && (
                <div className="mb-2 flex gap-2">
                  <div className="relative h-10 w-10">
                    <Image
                      src={stream.avatar}
                      alt={`${stream.authorName}'s image`}
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{stream.authorName}</p>
                    <p className="flex items-center gap-1 text-sm text-[#616572]">
                      Posted{" "}
                      {isToday(stream.created_at)
                        ? "today"
                        : isYesterday(stream.created_at)
                          ? "yesterday"
                          : format(stream.created_at, "MMM d")}
                      {stream.updatedPost && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                          />
                        </svg>
                      )}
                    </p>
                  </div>
                </div>
              )}
              {stream.type !== "stream" && (
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm text-[#616572]">
                    {stream.dueDate && stream.hasDueDate === "true" ? (
                      <p>
                        {isToday(stream.dueDate)
                          ? `Due today, ${format(stream.dueDate, "h:mm a")}`
                          : isYesterday(stream.dueDate)
                            ? `Due yesterday, ${format(stream.dueDate, "h:mm a")}`
                            : `Due ${format(stream.dueDate, "MMM d,")} ${isThisYear(stream.dueDate) ? "" : `${format(stream.dueDate, "y ")}`} ${format(stream.dueDate, "h:mm a")}`}
                      </p>
                    ) : (
                      <p>No due date</p>
                    )}
                    {stream.points !== null && (
                      <p className="font-medium">{stream.points} points</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {stream.type === "assignment" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-8 flex-shrink-0 stroke-[#5c7cfa]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                        />
                      </svg>
                    )}
                    {stream.type === "quiz" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-8 flex-shrink-0 stroke-[#5c7cfa]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                        />
                      </svg>
                    )}
                    {stream.type === "material" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-8 flex-shrink-0 stroke-[#5c7cfa]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                        />
                      </svg>
                    )}
                    {stream.type === "question" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-8 flex-shrink-0 stroke-[#5c7cfa]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                        />
                      </svg>
                    )}
                    <div className="mb-2">
                      <p className="text-xl font-medium">{stream.title}</p>
                      <div className="flex items-center gap-1 text-xs text-[#616572] md:text-sm">
                        <p>{stream.authorName}</p>
                        <span>•</span>
                        <p>
                          Posted{" "}
                          {isToday(stream.created_at)
                            ? "today"
                            : isYesterday(stream.created_at)
                              ? "yesterday"
                              : format(stream.created_at, "MMM d")}
                        </p>
                        {stream.updatedPost && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="size-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {stream.caption && (
                <Linkify componentDecorator={captionLinksDecorator}>
                  <p className="overflow-wrap mb-2 whitespace-pre-line break-words">
                    {stream.caption}
                  </p>
                </Linkify>
              )}
              {stream.attachment.length || stream.links.length ? (
                <div className="mb-2">
                  <ul
                    className={`grid gap-[2px] font-medium ${stream.attachment.length > 1 && "md:grid-cols-2"}`}
                  >
                    {stream.attachment.map((file, index) => (
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
                        attachmentAmount={stream.links.length}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            {optimisticComments?.length ? (
              <ul className="grid gap-1 border-t-2 border-[#dbe4ff] pt-2">
                <li className="text-xs font-medium md:text-sm">Comments</li>
                {optimisticComments?.map((comment) => (
                  <StreamCommentCard
                    key={comment.id}
                    stream={stream}
                    classroom={classroom}
                    session={session}
                    comment={comment}
                    deleteCommentIsPending={deleteCommentIsPending}
                    onDeleteComment={handleDeleteComment}
                  />
                ))}
              </ul>
            ) : null}
          </div>
          {(classroom.allowStudentsToComment ||
            classroom.teacherId === session.user.id) && (
            <div>
              <form
                className="comment__form mt-2 flex w-full items-center rounded-md border-2 border-[#dbe4ff]"
                onSubmit={handleCommentSubmit}
              >
                <input
                  type="text"
                  name="classroomId"
                  defaultValue={classroom.classroomId}
                  hidden
                />
                <input
                  type="text"
                  name="streamId"
                  defaultValue={stream.id}
                  hidden
                />
                <textarea
                  required
                  disabled={addCommentIsPending}
                  name="comment"
                  className="comment__textarea h-10 w-full resize-none bg-transparent py-2 pl-4 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572]"
                  placeholder={`${addCommentIsPending ? "Adding your comment..." : "Add class comment"}`}
                  value={streamComment}
                  onChange={(event) => setStreamComment(event.target.value)}
                ></textarea>

                <button className="py-2 pr-4" disabled={addCommentIsPending}>
                  {addCommentIsPending ? (
                    <div className="spinner__mini dark"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      className="size-6 stroke-[#22317c]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                      />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          )}
          <div className="absolute right-0 top-0">
            <div className="relative" ref={ellipsisWrapperRef}>
              <button onClick={handleToggleEllipsis} type="button">
                <svg
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
              <EllipsisPopover
                showEdit={
                  session.user.id === stream.author ||
                  session.user.id === classroom.teacherId
                }
                clipboardUrl={`scholaflow.vercel.app${pathname}`}
                onToggleEllipsis={handleToggleEllipsis}
                showEllipsis={ellipsis}
                onShowEditForm={handleToggleShowEditModal}
                onShowConfirmationScreen={handleToggleShowStreamConfirmation}
              />
              {showStreamConfirmation && (
                <ConfirmationScreen
                  type="delete"
                  btnLabel="Delete"
                  isLoading={deleteStreamPostIsPending}
                  handleCancel={handleToggleShowStreamConfirmation}
                  handleAction={() => {
                    handleToggleShowStreamConfirmation();
                    deleteStreamPost(stream.id);
                  }}
                >
                  Are you sure you want to delete this post?
                </ConfirmationScreen>
              )}
            </div>
          </div>
          {showEditModal && (
            <StreamForm
              streamType={stream.type}
              formType="edit"
              stream={stream}
              session={session}
              classroom={classroom}
              enrolledClasses={enrolledClasses}
              onToggleShowStreamForm={handleToggleShowEditModal}
            />
          )}
        </div>
      </div>
      {session.user.id !== classroom.teacherId &&
        ((stream.announceTo.includes(session.user.id) &&
          stream.announceToAll === false) ||
          stream.announceToAll) &&
        stream.type !== "stream" &&
        stream.type !== "material" && (
          <StreamDetailsUserWork
            stream={stream}
            session={session}
            classroom={classroom}
            classwork={classwork}
            onGetAllPrivateComments={onGetAllPrivateComments}
          />
        )}
    </section>
  );
}
