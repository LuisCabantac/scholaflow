"use client";

import { useEffect, useOptimistic, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ISession } from "@/lib/auth";
import { capitalizeFirstLetter } from "@/lib/utils";
import {
  addGradeClasswork,
  addPrivateComment,
  deletePrivateComment,
} from "@/lib/classroom-actions";
import { IClasswork } from "@/app/user/classroom/class/[classId]/classwork/page";
import {
  IStream,
  IStreamComment,
} from "@/app/user/classroom/class/[classId]/page";

import Button from "@/components/Button";
import { IClass } from "@/components/ClassroomSection";
import AttachmentLinkCard from "@/components/AttachmentLinkCard";
import AttachmentFileCard from "@/components/AttachmentFileCard";
import StreamCommentCard from "@/components/StreamCommentCard";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

export default function StreamSubmissionsSection({
  stream,
  session,
  classroom,
  turnedInUsers,
  enrolledUsers,
  onGetAllPrivateComments,
  onGetAssignedUserClasswork,
}: {
  stream: IStream;
  session: ISession;
  classroom: IClass;
  turnedInUsers: IClasswork[] | null;
  enrolledUsers: IClass[] | null;
  onGetAllPrivateComments: (
    streamId: string,
  ) => Promise<IStreamComment[] | null>;
  onGetAssignedUserClasswork: (
    userId: string,
    classId: string,
    streamId: string,
  ) => Promise<IClasswork | null>;
}) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user");
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [streamComment, setStreamComment] = useState("");
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [expandUserWork, setExpandUserWork] = useState(false);
  const [expandPrivateComments, setExpandPrivateComments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachmentImagesNames, setAttachmentImagesNames] = useState<string[]>(
    [],
  );
  const [attachmentImages, setAttachmentImages] = useState<File[]>([]);

  const { data: classwork } = useQuery({
    queryKey: [userId],
    queryFn: () =>
      onGetAssignedUserClasswork(userId ?? "", stream.classroomId, stream.id),
  });

  const [grade, setGrade] = useState(classwork?.userPoints ?? "");

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

  async function handleSubmitGrade(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const { success, message } = await addGradeClasswork(formData);
    setIsLoading(false);
    if (success) {
      toast.success(message);
      handleToggleShowGradeModal();
    } else toast.error(message);
  }

  function handleGradeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = event.target.value;
    if (/^\d*$/.test(inputValue)) {
      setGrade(inputValue);
    }
  }

  function handleToggleShowGradeModal() {
    setShowGradeModal(!showGradeModal);
  }

  function handleToggleExpandUserWork() {
    setExpandUserWork(!expandUserWork);
  }

  function handleToggleExpandPrivateComments() {
    setExpandPrivateComments(!expandPrivateComments);
  }

  useEffect(() => {
    setStreamComment("");
  }, [userId]);

  useClickOutsideHandler(
    wrapperRef,
    () => {
      setShowGradeModal(false);
    },
    false,
  );

  return (
    <section className="grid items-start">
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 text-sm font-medium shadow-sm md:text-base">
          <Link
            href={`/user/classroom/class/${stream.classroomId}/stream/${stream.id}`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Instructions
          </Link>
          <Link
            href={`/user/classroom/class/${stream.classroomId}/stream/${stream.id}/submissions`}
            className="rounded-md bg-[#edf2ff] px-3 py-2 shadow-sm transition-all"
          >
            Submissions
          </Link>
        </div>
        <div className="grid w-full items-start gap-8 md:grid-cols-[1fr_2fr]">
          <div className="grid gap-2">
            <h2 className="text-lg font-medium md:text-xl">
              {stream.title.length > 20
                ? stream.title.slice(0, 20).concat("...")
                : stream.title}
            </h2>
            <div className="flex items-center justify-around rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-3 shadow-sm">
              <div>
                <p className="text-2xl font-semibold">
                  {turnedInUsers?.filter((users) => users.isTurnedIn).length}
                </p>
                <h4 className="text-xs font-medium text-[#616572]">
                  Turned in
                </h4>
              </div>
              <div className="mx-4 h-8 w-px bg-[#dbe4ff]"></div>
              <div>
                <p className="text-2xl font-semibold">
                  {stream?.announceToAll
                    ? enrolledUsers?.length
                    : stream.announceTo.length}
                </p>
                <h4 className="text-xs font-medium text-[#616572]">Assigned</h4>
              </div>
              <div className="mx-4 h-8 w-px bg-[#dbe4ff]"></div>
              <div>
                <p className="text-2xl font-semibold">
                  {turnedInUsers?.filter((users) => users.isGraded).length}
                </p>
                <h4 className="text-xs font-medium text-[#616572]">Graded</h4>
              </div>
            </div>
            {turnedInUsers?.filter((user) => user.isTurnedIn).length ? (
              <div className="grid gap-2">
                <p className="text-sm font-medium">Turned in</p>
                <ul className="grid gap-2">
                  {turnedInUsers
                    ?.filter((user) => user.isTurnedIn)
                    .map((user) => (
                      <li key={user.id} onClick={handleToggleExpandUserWork}>
                        <Link
                          href={`/user/classroom/class/${stream.classroomId}/stream/${stream.id}/submissions?name=${user.userName.split(" ").join("-").toLowerCase()}&user=${user.userId}`}
                          className="flex gap-2"
                        >
                          <Image
                            src={user.userAvatar}
                            alt={user.userName}
                            width={30}
                            height={30}
                            className="rounded-full"
                          />
                          <p>{user.userName}</p>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ) : null}
            {enrolledUsers?.filter((user) =>
              stream.announceTo.includes(user.userId),
            ).length ||
            (stream.announceToAll && enrolledUsers?.length) ? (
              <div className="grid w-full gap-2">
                <p className="text-sm font-medium">Assigned</p>
                <ul className="grid gap-2">
                  {stream.announceToAll
                    ? enrolledUsers?.map((user) => (
                        <li key={user.id} onClick={handleToggleExpandUserWork}>
                          <Link
                            href={`/user/classroom/class/${stream.classroomId}/stream/${stream.id}/submissions?name=${user.userName.split(" ").join("-").toLowerCase()}&user=${user.userId}`}
                            className="flex items-center justify-between"
                          >
                            <div className="flex gap-2">
                              <Image
                                src={user.userAvatar}
                                alt={user.userName}
                                width={30}
                                height={30}
                                className="rounded-full"
                              />
                              <p>{user.userName}</p>
                            </div>
                            <div>
                              {turnedInUsers?.find(
                                (turnedIn) => turnedIn.userId === user.userId,
                              )?.isTurnedIn ? (
                                <p className="text-sm font-medium text-[#616572]">
                                  {(new Date(stream?.dueDate ?? "") >
                                    new Date() &&
                                    stream?.hasDueDate === "true") ||
                                  stream?.hasDueDate === "false"
                                    ? "Turned in"
                                    : "Done late"}
                                </p>
                              ) : (
                                stream.hasDueDate === "true" &&
                                new Date(stream?.dueDate ?? "") <
                                  new Date() && (
                                  <p className="text-sm font-medium text-[#f03e3e]">
                                    Missing
                                  </p>
                                )
                              )}
                            </div>
                          </Link>
                        </li>
                      ))
                    : enrolledUsers
                        ?.filter((user) =>
                          stream.announceTo.includes(user.userId),
                        )
                        .map((user) => (
                          <li
                            key={user.id}
                            onClick={handleToggleExpandUserWork}
                          >
                            <Link
                              href={`/user/classroom/class/${stream.classroomId}/stream/${stream.id}/submissions?name=${user.userName.split(" ").join("-").toLowerCase()}&user=${user.userId}`}
                              className="flex items-center justify-between"
                            >
                              <div className="flex gap-2">
                                <Image
                                  src={user.userAvatar}
                                  alt={user.userName}
                                  width={30}
                                  height={30}
                                  className="rounded-full"
                                />
                                <p>{user.userName}</p>
                              </div>
                              <div>
                                {turnedInUsers?.find(
                                  (turnedIn) => turnedIn.userId === user.userId,
                                )?.isTurnedIn ? (
                                  <p className="text-sm font-medium text-[#616572]">
                                    {new Date(stream?.dueDate ?? "") >
                                    new Date()
                                      ? "Turned in"
                                      : "Done late"}
                                  </p>
                                ) : (
                                  stream.hasDueDate === "true" &&
                                  !turnedInUsers?.find(
                                    (turnedIn) =>
                                      turnedIn.userId === user.userId,
                                  )?.isTurnedIn &&
                                  new Date(stream?.dueDate ?? "") <
                                    new Date() && (
                                    <p className="text-sm font-medium text-[#f03e3e]">
                                      Missing
                                    </p>
                                  )
                                )}
                              </div>
                            </Link>
                          </li>
                        ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div
            className={`fixed bottom-0 left-0 right-0 z-10 h-full overflow-y-scroll border-[#dbe4ff] bg-[#f3f6ff] p-3 md:static md:h-auto md:rounded-md md:border-2 md:p-4 ${userId && expandUserWork ? "block" : "hidden"} ${userId ? "md:block" : "md:hidden"}`}
          >
            <div className="relative min-h-screen pb-[6rem] md:min-h-0 md:pb-0">
              <button
                className="disabled:cursor-not-allowed md:hidden"
                onClick={handleToggleExpandUserWork}
              >
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {stream.points && (
                <button
                  className="absolute right-[0.15rem] top-[2.1rem] md:right-0 md:top-1"
                  onClick={handleToggleShowGradeModal}
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
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                </button>
              )}
              {showGradeModal && (
                <div className="modal__container">
                  <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
                    <div
                      className="grid gap-2 rounded-md bg-[#f3f6ff] p-4"
                      ref={wrapperRef}
                    >
                      <div className="relative flex items-center gap-2">
                        <button
                          className="absolute right-0 top-0"
                          onClick={handleToggleShowGradeModal}
                          disabled={isLoading}
                        >
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
                              d="M6 18 18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
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
                            d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                          />
                        </svg>
                        <p className="text-lg font-medium">Grade</p>
                      </div>
                      <form onSubmit={handleSubmitGrade}>
                        <input
                          type="text"
                          name="classworkId"
                          value={classwork?.id}
                          hidden
                        />
                        <input
                          type="text"
                          name="classroomId"
                          value={classroom.classroomId}
                          hidden
                        />
                        <input
                          type="text"
                          name="streamId"
                          value={stream.id}
                          hidden
                        />
                        <input
                          type="text"
                          name="userId"
                          value={userId ?? ""}
                          hidden
                        />
                        <input
                          type="number"
                          name="userPoints"
                          required
                          className="rounded-md border-2 border-[#dbe4ff] bg-transparent px-5 py-3 focus:border-[#384689] focus:outline-none disabled:text-[#616572]"
                          disabled={isLoading}
                          value={grade}
                          onChange={handleGradeChange}
                        />
                        <div className="mt-2 flex items-center justify-end">
                          <Button type="primary" isLoading={isLoading}>
                            Done
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              {turnedInUsers?.filter((user) => user.userId === userId)
                .length ? (
                turnedInUsers
                  ?.filter((user) => user.userId === userId)
                  .map((works) => (
                    <div key={works.id} className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-medium">{works.userName}</p>
                        {stream.points && (
                          <p className="pr-6">
                            {works.userPoints} / {stream.points}
                          </p>
                        )}
                      </div>
                      {works.attachment.length || works.links.length ? (
                        <div className="grid gap-2">
                          <label className="text-xs font-medium md:text-sm">
                            Attachments
                          </label>
                          <ul className="grid max-h-full gap-1 overflow-y-auto md:max-h-44">
                            {works.attachment.length
                              ? works.attachment.map((file, index) => (
                                  <AttachmentFileCard
                                    file={file}
                                    index={index}
                                    type="curFile"
                                    location="form"
                                    isLoading={false}
                                    key={file}
                                  />
                                ))
                              : null}
                            {works.links.length
                              ? works.links.map((link, index) => (
                                  <AttachmentLinkCard
                                    link={link}
                                    index={index}
                                    location="form"
                                    isLoading={false}
                                    key={link}
                                  />
                                ))
                              : null}
                          </ul>
                        </div>
                      ) : (
                        <p>No attachments</p>
                      )}
                    </div>
                  ))
              ) : (
                <>
                  <p className="text-lg font-medium">
                    {capitalizeFirstLetter(
                      searchParams.get("name")?.split("-").join(" ") ?? "",
                    )}
                  </p>
                  <p>No attachments</p>
                </>
              )}
              <div className="hidden flex-col bg-[#f3f6ff] md:flex">
                <div>
                  <div className="mt-2 border-t-2 border-[#dbe4ff] pt-2">
                    <p className="text-sm font-medium">Private comments</p>
                    <div className="w-full bg-[#f3f6ff] py-1">
                      <form
                        className="flex items-end gap-2"
                        onSubmit={handleCommentSubmit}
                      >
                        <label
                          className={`py-3 ${
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
                            className="size-6 stroke-[#5c7cfa]"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                          </svg>
                        </label>
                        <div
                          className={`comment__form flex w-full rounded-md border-2 border-[#dbe4ff] ${streamComment.length > 50 ? "items-end" : "items-center"}`}
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
                            defaultValue={userId ?? ""}
                            hidden
                          />
                          <input
                            type="text"
                            name="streamId"
                            defaultValue={stream.id}
                            hidden
                          />
                          <textarea
                            required={!attachmentImagesNames.length}
                            disabled={addCommentIsPending}
                            name="comment"
                            className={`comment__textarea w-full resize-none bg-transparent py-3 pl-5 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] ${streamComment.length > 50 ? "h-28" : "h-12"}`}
                            placeholder={`${addCommentIsPending ? "Adding your comment..." : "Add private comment"}`}
                            value={streamComment}
                            onChange={(event) =>
                              setStreamComment(event.target.value)
                            }
                          ></textarea>
                          <button
                            className="py-3 pr-5"
                            disabled={addCommentIsPending}
                          >
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
                        </div>
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
                    {optimisticComments?.filter(
                      (comment) =>
                        (comment.author === session.user.id &&
                          comment.toUserId === userId) ||
                        (comment.author === userId &&
                          comment.toUserId === session.user.id),
                    ).length ? (
                      <ul className="mt-1 grid max-h-[20rem] gap-2 overflow-y-auto">
                        {!streamsCommentsIsPending &&
                          optimisticComments
                            ?.filter(
                              (comment) =>
                                (comment.author === session.user.id &&
                                  comment.toUserId === userId) ||
                                (comment.author === userId &&
                                  comment.toUserId === session.user.id),
                            )
                            .map((comment) => (
                              <StreamCommentCard
                                key={comment.id}
                                comment={comment}
                                stream={stream}
                                session={session}
                                classroom={classroom}
                                deleteCommentIsPending={
                                  deletePrivateCommentIsPending
                                }
                                onDeleteComment={handleDeleteComment}
                              />
                            ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="fixed bottom-0 left-0 right-0 flex flex-col bg-[#f3f6ff] md:static md:hidden">
                <div>
                  <div className="flex-end flex flex-col gap-2 border-t-2 border-[#dbe4ff] px-3 pt-2 md:mt-2 md:px-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Private comments</p>
                      {optimisticComments?.filter(
                        (comment) =>
                          (comment.author === session.user.id &&
                            comment.toUserId === userId) ||
                          (comment.author === userId &&
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
                    {optimisticComments?.filter(
                      (comment) =>
                        (comment.author === session.user.id &&
                          comment.toUserId === userId) ||
                        (comment.author === userId &&
                          comment.toUserId === session.user.id),
                    ).length ? (
                      <ul
                        className={`grid gap-2 ${expandPrivateComments ? "max-h-[15rem] overflow-y-auto" : "max-h-0"}`}
                      >
                        {!streamsCommentsIsPending &&
                          optimisticComments
                            ?.filter(
                              (comment) =>
                                (comment.author === session.user.id &&
                                  comment.toUserId === userId) ||
                                (comment.author === userId &&
                                  comment.toUserId === session.user.id),
                            )
                            .map((comment) => (
                              <StreamCommentCard
                                key={comment.id}
                                comment={comment}
                                stream={stream}
                                session={session}
                                classroom={classroom}
                                deleteCommentIsPending={
                                  deletePrivateCommentIsPending
                                }
                                onDeleteComment={handleDeleteComment}
                              />
                            ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
                <div className="z-10 w-full bg-[#f3f6ff] px-3 pb-3 pt-1 md:px-0 md:pb-0">
                  <form
                    className="flex items-end gap-2"
                    onSubmit={handleCommentSubmit}
                  >
                    <label
                      className={`py-3 ${
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
                        className="size-6 stroke-[#5c7cfa]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
                    </label>
                    <div
                      className={`comment__form flex w-full rounded-md border-2 border-[#dbe4ff] ${streamComment.length > 50 ? "items-end" : "items-center"}`}
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
                        defaultValue={userId ?? ""}
                        hidden
                      />
                      <input
                        type="text"
                        name="streamId"
                        defaultValue={stream.id}
                        hidden
                      />
                      <textarea
                        required={!attachmentImagesNames.length}
                        disabled={addCommentIsPending}
                        name="comment"
                        className={`comment__textarea w-full resize-none bg-transparent py-3 pl-5 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] ${streamComment.length > 50 ? "h-28" : "h-12"}`}
                        placeholder={`${addCommentIsPending ? "Adding your comment..." : "Add private comment"}`}
                        value={streamComment}
                        onChange={(event) =>
                          setStreamComment(event.target.value)
                        }
                      ></textarea>
                      <button
                        className="py-3 pr-5"
                        disabled={addCommentIsPending}
                      >
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
                    </div>
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
          </div>
        </div>
      </div>
    </section>
  );
}
