import React, { useOptimistic, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ISession } from "@/lib/auth";
import {
  addPrivateComment,
  deletePrivateComment,
  submitClasswork,
  unsubmitClasswork,
  updateClasswork,
} from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import { IClasswork } from "@/app/user/classroom/class/[classId]/classwork/page";
import {
  IStream,
  IStreamComment,
} from "@/app/user/classroom/class/[classId]/page";

import Button from "@/components/Button";
import AttachmentLinkCard from "@/components/AttachmentLinkCard";
import AttachmentFileCard from "@/components/AttachmentFileCard";
import SpinnerMini from "@/components/SpinnerMini";
import StreamCommentCard from "@/components/StreamCommentCard";
import { IClass } from "@/components/ClassroomSection";

export default function StreamDetailsUserWork({
  stream,
  session,
  classroom,
  classwork,
  onGetAllPrivateComments,
}: {
  stream: IStream;
  session: ISession;
  classroom: IClass;
  classwork: IClasswork | null | undefined;
  onGetAllPrivateComments: (
    streamId: string,
  ) => Promise<IStreamComment[] | null>;
}) {
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const addLinkModalWrapperRef = useRef<HTMLDivElement>(null);
  const addWorkPopoverWrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandModalView, setExpandModalView] = useState(false);
  const [showAddWorkPopover, setShowAddWorkPopover] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(
    classwork?.attachment ?? [],
  );
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [newUrlLinks, setNewUrlLinks] = useState<string[]>([]);
  const [currentUrlLinks, setCurrentUrlLinks] = useState<string[]>(
    classwork?.links ?? [],
  );
  const [url, setUrl] = useState<string>("");
  const [showEditSubmission, setShowEditSubmission] = useState(
    classwork?.isTurnedIn ?? false,
  );
  const [expandPrivateComments, setExpandPrivateComments] = useState(false);
  const [streamComment, setStreamComment] = useState("");

  async function handleSubmitClasswork(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    newUrlLinks.forEach((link) => formData.append("links", link));
    newAttachments.forEach((attachment) =>
      formData.append("attachments", attachment),
    );
    const { success, message } = await (!classwork
      ? submitClasswork(stream.classroomId, stream.id, formData)
      : updateClasswork(currentUrlLinks, currentAttachments, formData));
    setIsLoading(false);
    if (success) {
      toast.success(message);
      setShowEditSubmission(true);
    } else toast.error(message);
  }

  async function handleUnsubmitClasswork(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const { success, message } = await unsubmitClasswork(
      classwork?.id ?? "",
      stream.classroomId,
      stream?.id,
    );
    setIsLoading(false);
    if (success) {
      toast.success(message);
      handleToggleShowEditSubmission();
    } else toast.error(message);
  }

  const { data: streamsComments, isPending: streamsCommentsIsPending } =
    useQuery({
      queryKey: [`stream-${stream.id}-private-comments`],
      queryFn: () => onGetAllPrivateComments(stream.id),
    });

  const { mutate: addComment, isPending: addCommentIsPending } = useMutation({
    mutationFn: addPrivateComment,
    onSuccess: () => {
      toast.success("Comment has been added!");

      queryClient.invalidateQueries({
        queryKey: [`stream-${stream.id}-private-comments`],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const {
    mutate: deleteStreamPrivateComment,
    isPending: deletePrivateCommentIsPending,
  } = useMutation({
    mutationFn: ({
      streamId,
      commentId,
      classroomId,
    }: {
      streamId: string;
      commentId: string;
      classroomId: string;
    }) => deletePrivateComment(classroomId, streamId, commentId),
    onSuccess: () => {
      toast.success("Comment has been successfully deleted!");

      queryClient.invalidateQueries({
        queryKey: [`stream-${stream.id}-private-comments`],
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
    deleteStreamPrivateComment({ streamId, commentId, classroomId });
  }

  function handleCommentSubmit(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    addComment(formData);
    setStreamComment("");
  }

  function handleSetNewAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setNewAttachments((prevFiles) => [...prevFiles, ...files]);
    }
  }

  function handleAttachmentNameChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = event.target.files;
    if (files) {
      const newFileNames = Array.from(files).map((file) => file.name);
      setAttachmentNames(newFileNames);
    }
  }

  function handleRemoveCurrentAttachment(index: number) {
    setCurrentAttachments((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
  }

  function handleRemoveNewAttachment(index: number) {
    setNewAttachments((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
    setAttachmentNames((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
  }

  function handleSetNewUrlLinks(url: string) {
    if (url) {
      setNewUrlLinks([...newUrlLinks, url]);
      setUrl("");
      handleToggleShowAddLinkModal();
    }
  }

  function handleRemoveNewUrl(index: number) {
    setNewUrlLinks((prevFiles) =>
      prevFiles.filter((curlLink, i: number) => i !== index),
    );
  }

  function handleRemoveCurrentUrl(index: number) {
    setCurrentUrlLinks((prevFiles) =>
      prevFiles.filter((curlLink, i: number) => i !== index),
    );
  }

  function handleToggleShowAddLinkModal() {
    setShowAddLinkModal(!showAddLinkModal);
  }

  function handleToggleShowAddWorkPopover() {
    setShowAddWorkPopover(!showAddWorkPopover);
  }

  function handleToggleExpandModalView() {
    setExpandModalView(!expandModalView);
  }

  function handleToggleShowEditSubmission() {
    setShowEditSubmission(!showEditSubmission);
  }

  function handleToggleExpandPrivateComments() {
    setExpandPrivateComments(!expandPrivateComments);
  }

  useClickOutsideHandler(
    addLinkModalWrapperRef,
    () => {
      setShowAddLinkModal(false);
    },
    isLoading,
  );

  useClickOutsideHandler(
    addWorkPopoverWrapperRef,
    () => {
      setShowAddWorkPopover(false);
    },
    isLoading,
  );

  return (
    <article className="fixed bottom-3 left-3 right-3 rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-3 shadow-lg md:static md:bottom-4 md:left-4 md:right-4 md:w-[28rem] md:p-4 md:shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="mb-2 text-lg font-medium">Your work</h4>
        <div className="flex gap-1">
          {classwork?.isGraded && classwork?.isTurnedIn && (
            <p className="font-medium text-[#616572]">
              {classwork.userPoints} / {stream.points}
            </p>
          )}
          {!classwork?.isGraded &&
            classwork?.isTurnedIn &&
            ((new Date(stream?.dueDate ?? "") > new Date() &&
              stream?.hasDueDate === "true") ||
              stream?.hasDueDate === "false") && (
              <p className="font-medium text-[#616572]">Turned in</p>
            )}
          {!classwork?.isGraded &&
            classwork?.isTurnedIn &&
            new Date(stream?.dueDate ?? "") < new Date() &&
            stream?.hasDueDate === "true" && (
              <p className="font-medium text-[#616572]">Done late</p>
            )}
          {!classwork?.isTurnedIn &&
            new Date(stream?.dueDate ?? "") < new Date() &&
            stream?.hasDueDate === "true" &&
            stream.hasDueDate === "true" && (
              <p className="font-medium text-[#f03e3e]">Missing</p>
            )}
          <button
            onClick={handleToggleExpandModalView}
            className="block md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`${expandModalView ? "rotate-180" : "rotate-0"} size-6 transition-transform`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 15.75 7.5-7.5 7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
      {(currentAttachments.length ||
        attachmentNames.length ||
        currentUrlLinks.length ||
        newUrlLinks.length) &&
      !expandModalView ? (
        <div
          className="flex items-center gap-1 rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] p-3 text-sm shadow-sm md:hidden md:p-4 md:text-base"
          onClick={handleToggleExpandModalView}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            className="size-4 stroke-[#616572] md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
            />
          </svg>
          <span>
            {`See ${currentAttachments.length + currentUrlLinks.length + newUrlLinks.length + attachmentNames.length} attachment${currentAttachments.length + currentUrlLinks.length + newUrlLinks.length + attachmentNames.length > 1 ? "s" : ""}`}
          </span>
        </div>
      ) : null}
      {!currentAttachments.length &&
      !attachmentNames.length &&
      !currentUrlLinks.length &&
      !newUrlLinks.length ? (
        <p className="mb-2 text-sm text-[#616572]">
          You have no attachments uploaded.
        </p>
      ) : null}
      <div className={`${expandModalView ? "grid" : "hidden"} gap-2 md:grid`}>
        {currentAttachments.length || attachmentNames.length ? (
          <div className="grid gap-2">
            <label className="text-xs font-medium md:text-sm">Files</label>
            <ul
              className={`grid gap-1 overflow-y-auto md:max-h-40 ${expandPrivateComments ? "max-h-20" : "max-h-40"}`}
            >
              {attachmentNames.length
                ? attachmentNames.map((file, index) => (
                    <AttachmentFileCard
                      file={file}
                      index={index}
                      type="newFile"
                      location="form"
                      isLoading={
                        showEditSubmission ? showEditSubmission : isLoading
                      }
                      onRemoveAttachment={handleRemoveNewAttachment}
                      key={file}
                    />
                  ))
                : null}
              {currentAttachments.length
                ? currentAttachments.map((file, index) => (
                    <AttachmentFileCard
                      file={file}
                      index={index}
                      type="curFile"
                      location="form"
                      isLoading={
                        showEditSubmission ? showEditSubmission : isLoading
                      }
                      onRemoveAttachment={handleRemoveCurrentAttachment}
                      key={file}
                    />
                  ))
                : null}
            </ul>
          </div>
        ) : null}
        {currentUrlLinks.length || newUrlLinks.length ? (
          <div className="grid gap-2">
            <label className="text-xs font-medium md:text-sm">Links</label>

            <ul
              className={`grid gap-1 overflow-y-auto md:max-h-40 ${expandPrivateComments ? "max-h-20" : "max-h-40"}`}
            >
              {newUrlLinks.length
                ? newUrlLinks.map((link, index) => (
                    <AttachmentLinkCard
                      link={link}
                      index={index}
                      location="form"
                      isLoading={
                        showEditSubmission ? showEditSubmission : isLoading
                      }
                      onRemoveAttachment={handleRemoveNewUrl}
                      key={link}
                    />
                  ))
                : null}
              {currentUrlLinks.length
                ? currentUrlLinks.map((link, index) => (
                    <AttachmentLinkCard
                      link={link}
                      index={index}
                      location="form"
                      isLoading={
                        showEditSubmission ? showEditSubmission : isLoading
                      }
                      onRemoveAttachment={handleRemoveCurrentUrl}
                      key={link}
                    />
                  ))
                : null}
            </ul>
          </div>
        ) : null}
        <div className="block md:hidden">
          <div>
            <div className="flex-end flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium md:text-sm">
                  Private comments
                </label>
                {optimisticComments?.filter(
                  (comment) =>
                    (comment.author === session.user.id &&
                      comment.toUserId === classroom.teacherId) ||
                    (comment.author === classroom.teacherId &&
                      comment.toUserId === session.user.id),
                ).length ? (
                  <button
                    onClick={handleToggleExpandPrivateComments}
                    className="block text-xs text-[#22317c] md:hidden"
                  >
                    {expandPrivateComments ? "Minimize" : "Expand"}
                  </button>
                ) : null}
              </div>
              {optimisticComments?.length ? (
                <ul
                  className={`grid gap-2 overflow-y-auto md:max-h-[15rem] ${expandPrivateComments ? "max-h-[15rem]" : "h-0"}`}
                >
                  {!streamsCommentsIsPending &&
                    optimisticComments
                      ?.filter(
                        (comment) =>
                          (comment.author === session.user.id &&
                            comment.toUserId === classroom.teacherId) ||
                          (comment.author === classroom.teacherId &&
                            comment.toUserId === session.user.id),
                      )
                      .map((comment) => (
                        <StreamCommentCard
                          key={comment.id}
                          comment={comment}
                          stream={stream}
                          session={session}
                          classroom={classroom}
                          deleteCommentIsPending={deletePrivateCommentIsPending}
                          onDeleteComment={handleDeleteComment}
                        />
                      ))}
                </ul>
              ) : null}
            </div>
          </div>
          <div className="flex-end flex w-full items-center gap-2">
            <div className="relative h-8 w-8 flex-shrink-0 rounded-full">
              <Image
                src={session.user.image}
                alt={`${session.user.name}'s avatar`}
                fill
                className="rounded-full"
              />
            </div>
            <form
              className="comment__form mt-2 flex w-full items-center rounded-md border-2 border-[#dbe4ff]"
              onSubmit={handleCommentSubmit}
            >
              <input
                type="text"
                name="classroomId"
                defaultValue={stream.classroomId}
                hidden
              />
              <input
                type="text"
                name="classworkId"
                defaultValue={classwork?.id}
                hidden
              />
              <input
                type="text"
                name="userId"
                defaultValue={classroom.teacherId}
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
                className="comment__textarea h-10 w-full resize-none bg-transparent py-2 pl-4 placeholder:pt-[0.10rem] placeholder:text-sm placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572]"
                placeholder={`${addCommentIsPending ? "Adding your comment..." : "Add private comment"}`}
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
        </div>
      </div>

      <div
        className="item-center relative mt-2 grid gap-2"
        ref={addWorkPopoverWrapperRef}
      >
        {!showEditSubmission && (
          <>
            {!isLoading && (
              <button
                className={`flex w-full items-center justify-center gap-1 rounded-md text-sm font-medium shadow-sm transition-colors ${newAttachments.length || currentAttachments.length || currentUrlLinks.length || newUrlLinks.length ? "border-2 border-[#dbe4ff] bg-[#e1e7f5] px-[1.12rem] py-[0.65rem] text-[#22317c] hover:bg-[#d9dfee] disabled:bg-[#c5cde6]" : "bg-[#22317c] px-5 py-3 text-[#edf2ff] hover:bg-[#384689] disabled:cursor-not-allowed disabled:bg-[#1b2763] disabled:text-[#d5dae6]"}`}
                disabled={
                  isLoading ||
                  (!classwork?.isTurnedIn &&
                    new Date(stream?.dueDate ?? "") < new Date() &&
                    stream.closeSubmissionsAfterDueDate)
                }
                onClick={handleToggleShowAddWorkPopover}
              >
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span>Add work</span>
              </button>
            )}
            <form onSubmit={handleSubmitClasswork}>
              <input
                type="text"
                name="classworkId"
                defaultValue={classwork?.id ?? ""}
                hidden
              />
              <input
                type="checkbox"
                name="isTurned"
                defaultValue={classwork?.isTurnedIn.toString()}
                hidden
              />
              <input
                type="text"
                name="classroomId"
                defaultValue={stream?.classroomId ?? ""}
                hidden
              />
              <input
                type="text"
                name="streamId"
                defaultValue={stream?.id ?? ""}
                hidden
              />
              <button
                className={`flex w-full items-center justify-center rounded-md text-sm font-medium shadow-sm transition-colors ${newAttachments.length || currentAttachments.length || currentUrlLinks.length || newUrlLinks.length ? "bg-[#22317c] px-5 py-3 text-[#edf2ff] hover:bg-[#384689] disabled:bg-[#1b2763] disabled:text-[#d5dae6]" : "border-2 border-[#dbe4ff] bg-[#e1e7f5] px-[1.12rem] py-[0.65rem] text-[#22317c] hover:bg-[#d9dfee] disabled:cursor-not-allowed disabled:bg-[#c5cde6]"}`}
                disabled={
                  isLoading ||
                  (!classwork?.isTurnedIn &&
                    new Date(stream?.dueDate ?? "") < new Date() &&
                    stream.closeSubmissionsAfterDueDate)
                }
              >
                {newAttachments.length ||
                currentAttachments.length ||
                currentUrlLinks.length ||
                newUrlLinks.length ? (
                  <span className="flex items-center gap-2">
                    {isLoading && <SpinnerMini />}
                    <p>Turn in</p>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLoading && <div className="spinner__mini dark"></div>}
                    <p>Mark as done</p>
                  </span>
                )}
              </button>
            </form>
          </>
        )}
        {showEditSubmission && (
          <button
            className="flex w-full items-center justify-center gap-1 rounded-md border-2 border-[#dbe4ff] bg-[#e1e7f5] px-[1.12rem] py-[0.65rem] text-sm font-semibold text-[#22317c] shadow-sm transition-colors hover:bg-[#d9dfee] disabled:cursor-not-allowed disabled:bg-[#c5cde6] md:gap-2"
            onClick={handleUnsubmitClasswork}
            disabled={isLoading}
          >
            {isLoading ? <SpinnerMini /> : "Unsubmit"}
          </button>
        )}
        <div className="hidden md:block">
          <div>
            <div className="flex-end flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium md:text-sm">
                  Private comments
                </label>
                {optimisticComments?.filter(
                  (comment) =>
                    (comment.author === session.user.id &&
                      comment.toUserId === classroom.teacherId) ||
                    (comment.author === classroom.teacherId &&
                      comment.toUserId === session.user.id),
                ).length ? (
                  <button
                    onClick={handleToggleExpandPrivateComments}
                    className="block text-xs text-[#22317c] md:hidden"
                  >
                    {expandPrivateComments ? "Minimize" : "Expand"}
                  </button>
                ) : null}
              </div>
              {optimisticComments?.length ? (
                <ul className="grid gap-2 overflow-y-auto md:max-h-[15rem]">
                  {!streamsCommentsIsPending &&
                    optimisticComments
                      ?.filter(
                        (comment) =>
                          (comment.author === session.user.id &&
                            comment.toUserId === classroom.teacherId) ||
                          (comment.author === classroom.teacherId &&
                            comment.toUserId === session.user.id),
                      )
                      .map((comment) => (
                        <StreamCommentCard
                          key={comment.id}
                          comment={comment}
                          stream={stream}
                          session={session}
                          classroom={classroom}
                          deleteCommentIsPending={deletePrivateCommentIsPending}
                          onDeleteComment={handleDeleteComment}
                        />
                      ))}
                </ul>
              ) : null}
            </div>
          </div>
          <div className="flex-end flex w-full items-center gap-2">
            <div className="relative h-8 w-8 flex-shrink-0 rounded-full">
              <Image
                src={session.user.image}
                alt={`${session.user.name}'s avatar`}
                fill
                className="rounded-full"
              />
            </div>
            <form
              className="comment__form mt-2 flex w-full items-center rounded-md border-2 border-[#dbe4ff]"
              onSubmit={handleCommentSubmit}
            >
              <input
                type="text"
                name="classroomId"
                defaultValue={stream.classroomId}
                hidden
              />
              <input
                type="text"
                name="classworkId"
                defaultValue={classwork?.id}
                hidden
              />
              <input
                type="text"
                name="userId"
                defaultValue={classroom.teacherId}
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
                className="comment__textarea h-10 w-full resize-none bg-transparent py-2 pl-4 placeholder:pt-[0.10rem] placeholder:text-sm placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572]"
                placeholder={`${addCommentIsPending ? "Adding your comment..." : "Add private comment"}`}
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
        </div>
        <div
          className={`${showAddWorkPopover ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} absolute -top-24 right-0 z-20 grid w-full gap-2 rounded-md bg-[#f3f6ff] p-2 text-sm shadow-md transition-all ease-in-out md:top-12`}
        >
          <label
            className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-[#d8e0f5]"
            onClick={handleToggleShowAddWorkPopover}
          >
            <input
              type="file"
              multiple
              className="input__file hidden disabled:cursor-not-allowed"
              disabled={isLoading}
              onChange={(event) => {
                handleAttachmentNameChange(event);
                handleSetNewAttachment(event);
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              className="size-4 stroke-[#616572]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            <span>Upload files</span>
          </label>
          <button
            className="flex items-center gap-2 rounded-md p-2 hover:bg-[#d8e0f5]"
            onClick={handleToggleShowAddLinkModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4 stroke-[#616572]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
              />
            </svg>
            <span>Add links</span>
          </button>
        </div>
      </div>
      {showAddLinkModal && (
        <div className="modal__container">
          <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
            <div
              className="grid w-full gap-2 rounded-md bg-[#f3f6ff] p-4 md:w-[25rem]"
              ref={addLinkModalWrapperRef}
            >
              <div className="grid gap-2">
                <h4 className="text-lg font-medium">Add link</h4>
                <input
                  type="text"
                  className="w-full rounded-md border-2 bg-transparent px-5 py-3 focus:border-[#384689] focus:outline-none"
                  placeholder="Enter a url..."
                  required
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  onKeyDown={(event) =>
                    event.key === "Enter" &&
                    showAddLinkModal &&
                    handleSetNewUrlLinks(url)
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="secondary" onClick={handleToggleShowAddLinkModal}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleSetNewUrlLinks(url)}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
