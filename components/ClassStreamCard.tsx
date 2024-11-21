import React, { useOptimistic, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { format, isToday, isYesterday } from "date-fns";
import Linkify from "react-linkify";
import {
  UseMutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { ISession } from "@/lib/auth";
import {
  addCommentToStream,
  deleteStreamComment,
} from "@/lib/classroom-actions";
import {
  IStream,
  IStreamComment,
} from "@/app/user/classroom/class/[classId]/page";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { IClass } from "@/components/ClassroomSection";
import ConfirmationModal from "@/components/ConfirmationModal";
import StreamCommentCard from "@/components/StreamCommentCard";
import AttachmentFileCard from "@/components/AttachmentFileCard";
import AttachmentLinkCard from "@/components/AttachmentLinkCard";
import EllipsisPopover from "@/components/EllipsisPopover";
import StreamForm from "@/components/StreamForm";
import { ITopic } from "@/components/TopicDialog";

export default function ClassStreamCard({
  topics,
  stream,
  session,
  classroom,
  showComments,
  enrolledClasses,
  onGetAllComments,
  onDeleteStreamPost,
  deleteStreamPostIsPending,
}: {
  topics: ITopic[] | null;
  stream: IStream;
  session: ISession;
  classroom: IClass;
  showComments?: boolean;
  enrolledClasses: IClass[] | null;
  onDeleteStreamPost: UseMutateFunction<undefined, Error, string, unknown>;
  deleteStreamPostIsPending: boolean;
  onGetAllComments: (streamId: string) => Promise<IStreamComment[] | null>;
}) {
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const [showClassComments, setShowClassComments] = useState(false);
  const [streamComment, setStreamComment] = useState("");
  const [showStreamConfirmation, setShowStreamConfirmation] = useState(false);
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [ellipsis, setEllipsis] = useState(false);
  const ellipsisWrapperRef = useRef<HTMLDivElement>(null);
  const [attachmentImagesNames, setAttachmentImagesNames] = useState<string[]>(
    [],
  );
  const [attachmentImages, setAttachmentImages] = useState<File[]>([]);

  const {
    data: streamsComments,
    isPending: streamsCommentsIsPending,
    refetch,
  } = useQuery({
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
    streamsComments,
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
    attachmentImages.forEach((attachment) =>
      formData.append("attachments", attachment),
    );
    addComment(formData);
    setStreamComment("");
    setAttachmentImages([]);
    setAttachmentImagesNames([]);
  }

  function handleSetAttachmentImages(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setAttachmentImages((prevFiles) => [...prevFiles, ...files]);
    }
  }

  function handleAttachmentImageNameChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = event.target.files;
    if (files) {
      const newFileNames = Array.from(files).map((file) => file.name);
      setAttachmentImagesNames(newFileNames);
    }
  }

  function handleRemoveAttachmentImage(index: number) {
    setAttachmentImages((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
    setAttachmentImagesNames((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
  }

  function handleToggleEllipsis() {
    setEllipsis(!ellipsis);
  }

  function handleToggleShowClassComments() {
    setShowClassComments(!showClassComments);
    refetch();
  }

  function handleToggleShowStreamConfirmation() {
    setShowStreamConfirmation(!showStreamConfirmation);
  }

  function handleToggleShowStreamForm() {
    setShowStreamForm(!showStreamForm);
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
    <li className="flex w-full flex-col rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
      <div
        className={`relative ${optimisticComments?.length && showComments && "border-b-2 border-[#dbe4ff] pb-3"}`}
      >
        {stream.type === "stream" && (
          <div>
            <Link
              href={`/user/classroom/class/${classroom.classroomId}/stream/${stream.id}`}
            >
              <div className="flex gap-2 pb-2">
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
                  <p className="flex items-center gap-1 text-xs text-[#616572]">
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
            </Link>
            <Linkify componentDecorator={captionLinksDecorator}>
              <p className="hidden whitespace-pre-line md:block">
                {stream.caption}
              </p>
              <p className="block whitespace-pre-line md:hidden">
                {stream.caption.length > 80
                  ? stream.caption.slice(0, 80).concat("...")
                  : stream.caption}
                {stream.caption.length > 80 && (
                  <span className="text-[#616572] hover:underline">
                    <Link
                      href={`/user/classroom/class/${classroom.classroomId}/stream/${stream.id}`}
                    >
                      {" "}
                      See more
                    </Link>
                  </span>
                )}
              </p>
            </Linkify>
            {stream.attachment.length || stream.links.length ? (
              <div className="mt-2 grid gap-2">
                <p className="font-medium">Attachments</p>
                <ul className="grid gap-1 font-medium">
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
        )}
        {stream.type !== "stream" && (
          <div>
            <Link
              href={`/user/classroom/class/${classroom.classroomId}/stream/${stream.id}`}
              className="underline__container flex gap-2"
            >
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
              <div>
                <p className="underline__text pr-2 font-medium">
                  {stream.title}
                </p>
                <p className="flex items-center gap-1 text-xs text-[#616572]">
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
            </Link>
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
              showEdit={session.user.id === stream.author}
              clipboardUrl={`scholaflow.vercel.app/user/classroom/class/${classroom.classroomId}/stream/${stream.id}`}
              showEllipsis={ellipsis}
              showDelete={session.user.id === stream.author}
              onToggleEllipsis={handleToggleEllipsis}
              onShowEditForm={handleToggleShowStreamForm}
              onShowConfirmationModal={handleToggleShowStreamConfirmation}
            />
            {showStreamConfirmation && (
              <ConfirmationModal
                type="delete"
                btnLabel="Delete"
                isLoading={deleteStreamPostIsPending}
                handleCancel={handleToggleShowStreamConfirmation}
                handleAction={() => {
                  handleToggleShowStreamConfirmation();
                  onDeleteStreamPost(stream.id);
                }}
              >
                Are you sure you want to delete this post?
              </ConfirmationModal>
            )}
          </div>
        </div>
      </div>
      {showComments && (
        <>
          <div>
            {optimisticComments?.length ? (
              <>
                <Link
                  href={`/user/classroom/class/${classroom.classroomId}/stream/${stream.id}`}
                  className="mt-2 block font-medium md:hidden"
                >
                  View all comments
                </Link>
                <button
                  onClick={handleToggleShowClassComments}
                  className={`${showClassComments && "mb-2"} mt-2 hidden font-medium md:block`}
                >
                  {showClassComments ? "Hide" : "View"} all comments
                </button>
              </>
            ) : null}
            <ul className="hidden max-h-[20rem] gap-2 overflow-y-auto md:grid">
              {showClassComments &&
                !streamsCommentsIsPending &&
                optimisticComments?.map((comment) => (
                  <StreamCommentCard
                    key={comment.id}
                    comment={comment}
                    stream={stream}
                    session={session}
                    classroom={classroom}
                    deleteCommentIsPending={deleteCommentIsPending}
                    onDeleteComment={handleDeleteComment}
                  />
                ))}
            </ul>
          </div>
          {(classroom.allowStudentsToComment ||
            classroom.teacherId === session.user.id) && (
            <>
              <Link
                href={`/user/classroom/class/${classroom.classroomId}/stream/${stream.id}`}
                className="mt-2 flex items-end gap-2 md:hidden"
              >
                <div className="flex h-9 w-full items-center justify-between rounded-md border-2 border-[#dbe4ff] px-4 py-2 text-[#616572]">
                  <span>Add class comment</span>
                  <div className="flex gap-4 py-2">
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
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
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
                  </div>
                </div>
              </Link>
              <div className="mt-2 hidden md:block">
                <form
                  className={`comment__form flex w-full rounded-md border-2 border-[#dbe4ff] ${streamComment.length > 50 ? "items-end" : "items-center"}`}
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
                    className={`comment__textarea w-full resize-none bg-transparent py-2 pl-4 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] ${streamComment.length > 50 ? "h-18" : "h-9"}`}
                    placeholder={`${addCommentIsPending ? "Adding your comment..." : "Add class comment"}`}
                    value={streamComment}
                    onChange={(event) => setStreamComment(event.target.value)}
                  ></textarea>
                  <label
                    className={`px-4 py-2 ${
                      addCommentIsPending
                        ? "disabled:cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                      disabled={addCommentIsPending}
                      onChange={(event) => {
                        handleAttachmentImageNameChange(event);
                        handleSetAttachmentImages(event);
                      }}
                    />
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
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </label>
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
                {attachmentImagesNames.length ? (
                  <ul className="my-2 grid gap-1 overflow-y-auto md:max-h-40">
                    {attachmentImagesNames.map((file, index) => (
                      <AttachmentFileCard
                        file={file}
                        index={index}
                        type="newFile"
                        location="form"
                        isLoading={addCommentIsPending}
                        onRemoveAttachment={handleRemoveAttachmentImage}
                        key={file}
                      />
                    ))}
                  </ul>
                ) : null}
              </div>
            </>
          )}
        </>
      )}
      {showStreamForm && (
        <StreamForm
          topics={topics}
          stream={stream}
          session={session}
          formType="edit"
          classroom={classroom}
          streamType={stream.type}
          enrolledClasses={enrolledClasses}
          onSetShowStreamForm={setShowStreamForm}
          onToggleShowStreamForm={handleToggleShowStreamForm}
        />
      )}
    </li>
  );
}
