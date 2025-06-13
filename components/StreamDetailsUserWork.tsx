import toast from "react-hot-toast";
import { motion } from "motion/react";
import { ChevronDown, ImagePlus, Plus, SendHorizontal } from "lucide-react";
import React, { useOptimistic, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useClickOutside } from "@/contexts/ClickOutsideContext";
import {
  Classroom,
  Classwork,
  Session,
  Stream,
  StreamPrivateComment,
} from "@/lib/schema";
import {
  addPrivateComment,
  deletePrivateComment,
  submitClasswork,
  unsubmitClasswork,
  updateClasswork,
} from "@/lib/classroom-actions";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SpinnerMini from "@/components/SpinnerMini";
import CommentCard from "@/components/CommentCard";
import CommentsLoading from "@/components/CommentsLoading";
import AttachmentLinkCard from "@/components/AttachmentLinkCard";
import AttachmentFileCard from "@/components/AttachmentFileCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StreamDetailsUserWork({
  stream,
  session,
  classroom,
  classwork,
  onGetAllPrivateComments,
}: {
  stream: Stream;
  session: Session;
  classroom: Classroom;
  classwork: Classwork | null | undefined;
  onGetAllPrivateComments: (
    streamId: string,
  ) => Promise<StreamPrivateComment[] | null>;
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
    classwork?.attachments ?? [],
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
  const [attachmentImagesNames, setAttachmentImagesNames] = useState<string[]>(
    [],
  );
  const [attachmentImages, setAttachmentImages] = useState<File[]>([]);

  async function handleSubmitClasswork(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    newUrlLinks.forEach((link) => formData.append("links", link));
    newAttachments.forEach((attachment) =>
      formData.append("attachments", attachment),
    );
    const { success, message } = await (!classwork
      ? submitClasswork(stream.classId, stream.id, formData)
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
      stream.classId,
      stream?.id,
    );
    setIsLoading(false);
    if (success) {
      toast.success(message);
      handleToggleShowEditSubmission();
    } else toast.error(message);
  }

  const { data: privateComments, isPending: privateCommentsIsPending } =
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
    onError: (error) => {
      toast.error(error.message);
    },
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
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [optimisticComments, optimisticDeleteComment] = useOptimistic(
    privateComments,
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
      const maxSize = 5 * 1024 * 1024;
      const validFiles = files.filter((file) => file.size <= maxSize);
      const invalidFiles = files.filter((file) => file.size > maxSize);

      if (invalidFiles.length > 0) {
        toast.error("Each attachment must be 5MB or less.");
      }

      setAttachmentImages((prevFiles) => [...prevFiles, ...validFiles]);
    }
  }

  function handleAttachmentImageNameChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = event.target.files;
    if (files) {
      const maxSize = 5 * 1024 * 1024;
      const validFiles = Array.from(files).filter(
        (file) => file.size <= maxSize,
      );
      const newFileNames = validFiles.map((file) => URL.createObjectURL(file));
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

  function handleSetNewAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const maxSize = 5 * 1024 * 1024;
      const validFiles: File[] = [];
      let hasOversized = false;

      files.forEach((file) => {
        if (file.size > maxSize) {
          hasOversized = true;
        } else {
          validFiles.push(file);
        }
      });

      if (hasOversized) {
        toast.error("Each file must be less than 5MB.");
      }

      if (validFiles.length) {
        setNewAttachments((prevFiles) => [...prevFiles, ...validFiles]);
      }
    }
  }

  function handleAttachmentNameChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = event.target.files;
    if (files) {
      const maxSize = 5 * 1024 * 1024;
      const newFileNames = Array.from(files)
        .filter((file) => file.size <= maxSize)
        .map((file) => file.name);
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
    <article className="fixed bottom-3 left-3 right-3 rounded-md border bg-card p-3 shadow-lg md:static md:bottom-4 md:left-4 md:right-4 md:w-[30rem] md:p-4 md:shadow-sm">
      <div
        className="flex cursor-pointer items-center justify-between md:cursor-auto"
        onClick={handleToggleExpandModalView}
      >
        <h4 className="mb-2 text-lg font-medium text-foreground">Your work</h4>
        <div className="flex items-center gap-1">
          {stream.points && classwork?.isGraded && (
            <p className="font-medium text-foreground">
              {classwork.points} / {stream.points}
            </p>
          )}
          {!classwork?.isGraded &&
            classwork?.isTurnedIn &&
            ((stream.dueDate && new Date(stream.dueDate) > new Date()) ||
              !stream.dueDate) && (
              <p className="font-medium text-foreground/90">Turned in</p>
            )}
          {!classwork?.isGraded &&
            classwork?.isTurnedIn &&
            stream.dueDate &&
            new Date(stream.dueDate) < new Date() && (
              <p className="font-medium text-foreground/90">Done late</p>
            )}
          {!classwork?.isTurnedIn &&
            stream.dueDate &&
            new Date(stream.dueDate) < new Date() && (
              <p className="font-medium text-destructive">Missing</p>
            )}
          <button
            onClick={handleToggleExpandModalView}
            className="block md:hidden"
            type="button"
          >
            <ChevronDown
              strokeWidth={3}
              className={`${expandModalView ? "rotate-180" : "rotate-0"} w-4 transition-transform`}
            />
          </button>
        </div>
      </div>
      {(currentAttachments.length ||
        attachmentNames.length ||
        currentUrlLinks.length ||
        newUrlLinks.length) &&
      !expandModalView ? (
        <div
          className="flex items-center gap-1 rounded-md border bg-card p-3 text-sm shadow-sm md:hidden md:p-4 md:text-base"
          onClick={handleToggleExpandModalView}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            className="size-4 stroke-foreground md:size-5"
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
        <p className="mb-2 text-sm text-foreground">
          You have no attachments uploaded.
        </p>
      ) : null}
      <div className={`${expandModalView ? "grid" : "hidden"} gap-2 md:grid`}>
        {currentAttachments.length || attachmentNames.length ? (
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground/90">
              Files
            </label>
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
            <label className="text-sm font-medium text-foreground/90">
              Links
            </label>
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
        <div className="z-10 block md:hidden">
          <div>
            <div className="flex-end flex flex-col">
              <div
                className={`flex items-center justify-between ${expandPrivateComments && "mb-2"}`}
              >
                <label className="text-sm font-medium">Private comments</label>
                {optimisticComments?.filter(
                  (comment) =>
                    (comment.userId === session.id &&
                      comment.toUserId === classroom.teacherId) ||
                    (comment.userId === classroom.teacherId &&
                      comment.toUserId === session.id),
                ).length ? (
                  <button
                    onClick={handleToggleExpandPrivateComments}
                    className="block text-sm text-primary md:hidden"
                  >
                    {expandPrivateComments ? "Minimize" : "Expand"}
                  </button>
                ) : null}
              </div>
              {optimisticComments?.length ? (
                <ul
                  className={`grid gap-2 overflow-y-auto md:max-h-[15rem] ${expandPrivateComments ? "max-h-[15rem]" : "h-0"}`}
                >
                  {privateCommentsIsPending &&
                    Array(6)
                      .fill(undefined)
                      .map((_, index) => <CommentsLoading key={index} />)}
                  {!privateCommentsIsPending &&
                    optimisticComments
                      ?.filter(
                        (comment) =>
                          (comment.userId === session.id &&
                            comment.toUserId === classroom.teacherId) ||
                          (comment.userId === classroom.teacherId &&
                            comment.toUserId === session.id),
                      )
                      .map((comment) => (
                        <CommentCard
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
          <div className="mt-1 w-full">
            <form
              className={`comment__form flex w-full rounded-xl border ${streamComment.length > 50 ? "items-end" : "items-center"}`}
              onSubmit={handleCommentSubmit}
            >
              <input
                type="text"
                name="classroomId"
                defaultValue={stream.classId}
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
                required={!attachmentImages.length}
                disabled={addCommentIsPending}
                name="comment"
                className={`comment__textarea w-full resize-none bg-transparent py-2 pl-4 placeholder:text-foreground focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:text-foreground ${streamComment.length > 50 ? "h-28" : "h-9"}`}
                placeholder={`${addCommentIsPending ? "Adding your comment..." : "Add private comment"}`}
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
                <ImagePlus className="size-5" />
              </label>
              <button className="py-2 pr-4" disabled={addCommentIsPending}>
                {addCommentIsPending ? (
                  <div className="spinner__mini dark"></div>
                ) : (
                  <SendHorizontal className="size-6 stroke-primary" />
                )}
              </button>
            </form>
            {attachmentImagesNames.length ? (
              <ul className="my-2 grid max-h-40 gap-1 overflow-y-auto">
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
        </div>
      </div>
      <div
        className="item-center relative mt-2 grid gap-2"
        ref={addWorkPopoverWrapperRef}
      >
        {!showEditSubmission && (
          <>
            {!isLoading && (
              <Button
                type="button"
                variant={
                  newAttachments.length ||
                  currentAttachments.length ||
                  currentUrlLinks.length ||
                  newUrlLinks.length
                    ? "secondary"
                    : "default"
                }
                disabled={
                  isLoading ||
                  (!classwork?.isTurnedIn &&
                    new Date(stream?.dueDate ?? "") < new Date() &&
                    stream.closeSubmissionsAfterDueDate)
                }
                onClick={handleToggleShowAddWorkPopover}
              >
                <Plus className="size-5" />
                Add work
              </Button>
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
                defaultValue={stream?.classId ?? ""}
                hidden
              />
              <input
                type="text"
                name="streamId"
                defaultValue={stream?.id ?? ""}
                hidden
              />
              <Button
                type="submit"
                className="mt-2 w-full"
                variant={
                  newAttachments.length ||
                  currentAttachments.length ||
                  currentUrlLinks.length ||
                  newUrlLinks.length
                    ? "default"
                    : "secondary"
                }
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
                    <p>
                      {classwork?.isGraded && stream.points
                        ? "Resubmit"
                        : "Mark as done"}
                    </p>
                  </span>
                )}
              </Button>
            </form>
          </>
        )}
        {showEditSubmission && (
          <Button
            variant="secondary"
            onClick={handleUnsubmitClasswork}
            disabled={isLoading}
          >
            {isLoading ? <SpinnerMini /> : "Unsubmit"}
          </Button>
          // <button
          //   className="flex h-10 w-full items-center justify-center gap-1 rounded-md bg-card px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-card/90 disabled:cursor-not-allowed disabled:bg-card/90 md:gap-2"
          //   onClick={handleUnsubmitClasswork}
          //   disabled={isLoading}
          // >
          //   {isLoading ? <SpinnerMini /> : "Unsubmit"}
          // </button>
        )}
        <div className="hidden md:block">
          <label className="text-sm font-medium">Private comments</label>
          <div className="mt-1">
            <form
              className={`comment__form flex w-full rounded-md border ${streamComment.length > 50 ? "items-end" : "items-center"}`}
              onSubmit={handleCommentSubmit}
            >
              <input
                type="text"
                name="classroomId"
                defaultValue={stream.classId}
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
                className={`comment__textarea w-full resize-none bg-transparent py-2 pl-4 placeholder:text-foreground focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:text-foreground ${streamComment.length > 50 ? "h-28" : "h-9"}`}
                placeholder={`${addCommentIsPending ? "Adding your comment..." : "Add private comment"}`}
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
                <ImagePlus className="size-5" />
              </label>
              <button className="py-2 pr-4" disabled={addCommentIsPending}>
                {addCommentIsPending ? (
                  <div className="spinner__mini dark"></div>
                ) : (
                  <SendHorizontal className="size-6 stroke-primary" />
                )}
              </button>
            </form>
            {attachmentImagesNames.length ? (
              <ul className="my-2 grid max-h-40 gap-1 overflow-y-auto">
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
          {privateCommentsIsPending && (
            <ul className="mt-2 grid max-h-[20rem] gap-2 overflow-y-auto">
              {Array(6)
                .fill(undefined)
                .map((_, index) => (
                  <CommentsLoading key={index} />
                ))}
            </ul>
          )}
          {optimisticComments?.filter(
            (comment) =>
              (comment.userId === session.id &&
                comment.toUserId === classroom.teacherId) ||
              (comment.userId === classroom.teacherId &&
                comment.toUserId === session.id),
          ).length ? (
            <ul className="mt-2 grid max-h-[20rem] gap-2 overflow-y-auto">
              {!privateCommentsIsPending &&
                optimisticComments
                  ?.filter(
                    (comment) =>
                      (comment.userId === session.id &&
                        comment.toUserId === classroom.teacherId) ||
                      (comment.userId === classroom.teacherId &&
                        comment.toUserId === session.id),
                  )
                  .map((comment) => (
                    <CommentCard
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
        <div
          className={`${showAddWorkPopover ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} absolute -top-24 right-0 z-20 grid w-full gap-2 rounded-xl border bg-card p-2 text-sm shadow-md transition-all ease-in-out md:top-12`}
        >
          <label
            className="hover:bg-card/89 flex cursor-pointer items-center gap-2 rounded-md p-2"
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
              className="size-4 stroke-foreground"
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
            className="hover:bg-card/89 flex items-center gap-2 rounded-md p-2"
            onClick={handleToggleShowAddLinkModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4 stroke-foreground"
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
        <motion.div
          className="modal__container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        >
          <motion.div
            className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="md:w-[25rem]" ref={addLinkModalWrapperRef}>
              <CardHeader className="text-lg font-medium tracking-tight">
                Add link
              </CardHeader>
              <CardContent className="grid gap-4">
                <Input
                  type="text"
                  placeholder="Enter a url"
                  required
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  onKeyDown={(event) =>
                    event.key === "Enter" &&
                    showAddLinkModal &&
                    (() => {
                      try {
                        new URL(url);
                        handleSetNewUrlLinks(url);
                      } catch {
                        toast.error("Please enter a valid URL.");
                      }
                    })()
                  }
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleToggleShowAddLinkModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      try {
                        new URL(url);
                        handleSetNewUrlLinks(url);
                      } catch {
                        toast.error("Please enter a valid URL.");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </article>
  );
}
