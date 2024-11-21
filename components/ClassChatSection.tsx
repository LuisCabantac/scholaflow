"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { ISession } from "@/lib/auth";
import { formatMessageDate, getFileExtension } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { addMessageToChat } from "@/lib/classroom-actions";

import AttachmentFileCard from "@/components/AttachmentFileCard";

export interface IChat {
  id: string;
  author: string;
  authorName: string;
  authorAvatar: string;
  message: string;
  classroomId: string;
  attachment: string[];
  created_at: string;
}

const imageExtensions: string[] = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "avif",
  "svg",
  "ico",
];

export default function ClassChatSection({
  classId,
  session,
  onGetAllMessages,
}: {
  classId: string;
  session: ISession;
  onGetAllMessages: (classId: string) => Promise<IChat[] | null>;
}) {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<null | HTMLLIElement>(null);
  const [message, setMessage] = useState("");
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [expandAttachments, setExpandAttachments] = useState(false);

  function openZoomedImage(imageUrl: string) {
    setZoomedImage(imageUrl);
  }

  function closeZoomedImage() {
    setZoomedImage(null);
  }

  const {
    data: messages,
    isPending: messagesIsPending,
    refetch,
  } = useQuery({
    queryKey: [`${classId}-messages`],
    queryFn: () => onGetAllMessages(classId),
  });

  const { mutate: addMessage, isPending: addMessageIsPending } = useMutation({
    mutationFn: addMessageToChat,
    onSuccess: () => {
      toast.success("Message has been sent");

      queryClient.invalidateQueries({
        queryKey: [`${classId}-messages`],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  function handleSubmitMessage(event: React.FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    newAttachments.forEach((attachment) =>
      formData.append("attachments", attachment),
    );
    addMessage(formData);
    setMessage("");
    setNewAttachments([]);
    setAttachmentNames([]);
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

  function handleRemoveNewAttachment(index: number) {
    setNewAttachments((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
    setAttachmentNames((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const channel = supabase
      .channel("chat-update")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat" },
        () => refetch(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function handleToggleExpandAttachments() {
    setExpandAttachments(!expandAttachments);
  }

  return (
    <section className="relative">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
          <Link
            href={`/user/classroom/class/${classId}`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Stream
          </Link>
          <Link
            href={`/user/classroom/class/${classId}/classwork`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Classwork
          </Link>
          <Link
            href={`/user/classroom/class/${classId}/people`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            People
          </Link>
          <Link
            href={`/user/classroom/class/${classId}/chat`}
            className="rounded-md bg-[#edf2ff] px-3 py-2 shadow-sm transition-all"
          >
            Chat
          </Link>
        </div>
      </div>
      <div className="flex w-full flex-col rounded-md md:border-2 md:border-[#dbe4ff] md:bg-[#f3f6ff] md:p-4">
        <div className="relative pb-16">
          <ul className="grid h-[75dvh] items-end gap-2 overflow-auto rounded-md md:h-[55dvh]">
            {messagesIsPending && !messages && (
              <>
                <li className="justify-self-end">
                  <div className="h-4 w-[50%] animate-pulse rounded-md bg-[#dbe4ff]"></div>
                </li>
                <li className="justify-self-start">
                  <div className="h-4 w-[30%] animate-pulse rounded-md bg-[#dbe4ff]"></div>
                </li>
                <li className="justify-self-start">
                  <div className="h-4 w-[80%] animate-pulse rounded-md bg-[#dbe4ff]"></div>
                </li>
                <li className="justify-self-end">
                  <div className="h-4 w-[20%] animate-pulse rounded-md bg-[#dbe4ff]"></div>
                </li>
                <li className="justify-self-end">
                  <div className="h-4 w-[50%] animate-pulse rounded-md bg-[#dbe4ff]"></div>
                </li>
                <li className="justify-self-start">
                  <div className="h-4 w-[20%] animate-pulse rounded-md bg-[#dbe4ff]"></div>
                </li>
              </>
            )}
            {messages?.length && !messagesIsPending ? (
              messages.map((message, index) => {
                const showAvatar =
                  index === messages.length - 1 ||
                  message.author !== messages[index + 1].author;

                const messageMargin =
                  message.author !== messages[index - 1]?.author ? "mt-4" : "";

                return (
                  <li
                    key={message.id}
                    className={`${messageMargin} ${
                      message.author === session.user.id
                        ? "justify-self-end"
                        : "justify-self-start"
                    }`}
                  >
                    <div className="flex items-end justify-end gap-2">
                      {message.author !== session.user.id && showAvatar ? (
                        <div className="relative mb-1 h-8 w-8 flex-shrink-0 rounded-full">
                          <Image
                            src={message.authorAvatar}
                            alt={`${message.authorName}'s avatar`}
                            fill
                            className="rounded-full object-contain"
                          />
                        </div>
                      ) : message.author !== session.user.id && !showAvatar ? (
                        <div className="mb-1 h-8 w-8 flex-shrink-0 rounded-full"></div>
                      ) : null}
                      <div>
                        {message.author !== session.user.id &&
                          message.author !== messages[index - 1]?.author && (
                            <p className="mb-1 text-xs font-semibold">
                              {message.authorName}
                            </p>
                          )}
                        {message.message && (
                          <div
                            className={`max-w-full whitespace-pre-line rounded-lg border-2 px-3 py-2 ${message.author === session.user.id && "bg-[#dbe4ff]"}`}
                          >
                            <p className={`max-w-full whitespace-pre-line`}>
                              {message.message}
                            </p>
                            <p
                              className={`mt-1 text-nowrap text-xs font-medium text-[#616572] ${session.user.id === message.author ? "text-left" : "text-right"}`}
                            >
                              {formatMessageDate(message.created_at)}
                            </p>
                          </div>
                        )}
                        {message.attachment.length
                          ? message.attachment.map((attachment) => {
                              if (
                                imageExtensions.includes(
                                  getFileExtension(attachment),
                                )
                              ) {
                                return (
                                  <div
                                    key={attachment}
                                    className="mt-2 cursor-pointer"
                                    onClick={() => openZoomedImage(attachment)}
                                  >
                                    <Image
                                      src={attachment}
                                      alt={attachment}
                                      width={100}
                                      height={100}
                                      className="w-[10rem] rounded-md object-cover md:w-[15rem]"
                                    />
                                  </div>
                                );
                              } else
                                return (
                                  <AttachmentFileCard
                                    file={attachment}
                                    index={index}
                                    type="newFile"
                                    location="form"
                                    isLoading={false}
                                    key={attachment}
                                  />
                                );
                            })
                          : null}
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="flex items-center justify-center">
                No messages has been sent yet.
              </li>
            )}
            <li ref={messagesEndRef} className="h-0 w-0"></li>
          </ul>
          <div className="fixed bottom-3 left-3 right-3 z-10 bg-[#edf2ff] pt-2 md:absolute md:bottom-0 md:left-0 md:right-0 md:w-full md:bg-[#f3f6ff] md:pt-0">
            {attachmentNames.length ? (
              <>
                <div className="flex justify-between border-t-2 border-[#dbe4ff] pt-2">
                  <p className="font-medium">Attachments</p>
                  <button type="button" onClick={handleToggleExpandAttachments}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className={`${expandAttachments ? "rotate-180" : "rotate-0"} size-6 transition-transform`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 15.75 7.5-7.5 7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>
                {!expandAttachments && (
                  <div
                    className="flex cursor-pointer items-center gap-1 rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] p-3 shadow-sm md:p-4"
                    onClick={handleToggleExpandAttachments}
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
                      {`See ${attachmentNames.length} attachment${attachmentNames.length > 1 ? "s" : ""}`}
                    </span>
                  </div>
                )}
                <ul className="mb-2 grid gap-1 overflow-y-auto md:max-h-40">
                  {expandAttachments &&
                    attachmentNames.map((file, index) => (
                      <AttachmentFileCard
                        file={file}
                        index={index}
                        type="newFile"
                        location="form"
                        isLoading={addMessageIsPending}
                        onRemoveAttachment={handleRemoveNewAttachment}
                        key={file}
                      />
                    ))}
                </ul>
              </>
            ) : null}
            <div className="flex items-center gap-2">
              <form
                className="flex w-full items-end gap-2"
                onSubmit={handleSubmitMessage}
              >
                <label
                  className={`py-[0.65rem] ${
                    addMessageIsPending
                      ? "disabled:cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    className="input__file hidden disabled:cursor-not-allowed"
                    disabled={addMessageIsPending}
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
                    className="size-6 stroke-[#5c7cfa]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </label>
                <div
                  className={`comment__form flex w-full rounded-md border-2 border-[#dbe4ff] ${message.length > 50 ? "items-end" : "items-center"}`}
                >
                  <input
                    type="text"
                    name="classroomId"
                    defaultValue={classId}
                    hidden
                  />
                  <textarea
                    name="message"
                    className={`comment__textarea w-full resize-none bg-transparent py-2 pl-4 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] ${message.length > 50 ? "h-28" : "h-9"}`}
                    value={message}
                    required={!newAttachments.length}
                    placeholder={
                      addMessageIsPending
                        ? "Adding your message..."
                        : "Add a message..."
                    }
                    disabled={addMessageIsPending}
                    onChange={(event) => setMessage(event.target.value)}
                  ></textarea>
                  <button
                    type="submit"
                    className="py-2 pr-4"
                    disabled={addMessageIsPending}
                  >
                    {addMessageIsPending ? (
                      <div className="spinner__mini dark"></div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        className="size-6 stroke-[#22317c] disabled:cursor-not-allowed"
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
            </div>
          </div>
        </div>
      </div>
      {zoomedImage && (
        <div className="modal__container" onClick={closeZoomedImage}>
          <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[40%]">
            <img
              src={zoomedImage}
              alt="zoomed__image"
              className="w-full object-cover"
            />
          </div>
        </div>
      )}
    </section>
  );
}
