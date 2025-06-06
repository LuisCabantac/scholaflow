"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactLinkify from "react-linkify";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { Chat, Session } from "@/lib/schema";
import { addMessageToChat } from "@/lib/classroom-actions";
import { formatMessageDate, getFileExtension } from "@/lib/utils";

import AttachmentFileCard from "@/components/AttachmentFileCard";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

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
  session: Session;
  onGetAllMessages: (classId: string) => Promise<Chat[] | null>;
}) {
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const messagesEndRef = useRef<null | HTMLLIElement>(null);
  const zoomedImageWrapperRef = useRef(null);
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
    onError: (error) => {
      toast.error(error.message);
    },
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
      .channel("chat-db-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat" },
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

  useClickOutsideHandler(
    zoomedImageWrapperRef,
    () => {
      setZoomedImage(null);
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
    <section className="relative">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
          <Link
            href={`/classroom/class/${classId}`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Stream
          </Link>
          <Link
            href={`/classroom/class/${classId}/classwork`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Classwork
          </Link>
          <Link
            href={`/classroom/class/${classId}/people`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            People
          </Link>
          <Link
            href={`/classroom/class/${classId}/chat`}
            className="rounded-md bg-[#edf2ff] px-3 py-2 shadow-sm transition-all"
          >
            Chat
          </Link>
        </div>
      </div>
      <div className="flex w-full flex-col rounded-md md:border md:border-[#dddfe6] md:bg-[#f3f6ff] md:p-4">
        <div className="relative pb-16">
          <ul className="flex h-[75dvh] flex-col justify-end gap-2 overflow-auto rounded-md md:h-[65dvh]">
            {messagesIsPending && !messages && (
              <div className="flex min-h-full flex-col justify-end">
                <li className="mb-12 self-end md:mb-[3.01rem]" role="status">
                  <span className="sr-only">Loading…</span>
                  <div className="h-4 w-40 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="mb-12 self-start md:mb-[3.01rem]" role="status">
                  <span className="sr-only">Loading…</span>
                  <div className="h-4 w-60 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="mb-12 self-start md:mb-[3.01rem]" role="status">
                  <span className="sr-only">Loading…</span>
                  <div className="h-4 w-60 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="mb-12 self-start md:mb-[3.01rem]" role="status">
                  <span className="sr-only">Loading…</span>
                  <div className="h-4 w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="mb-12 self-start md:mb-[3.01rem]" role="status">
                  <span className="sr-only">Loading…</span>
                  <div className="h-4 w-32 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="mb-12 self-end md:mb-[3.01rem]" role="status">
                  <span className="sr-only">Loading…</span>
                  <div className="h-4 w-56 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="mb-12 self-end md:mb-[3.01rem]" role="status">
                  <span className="sr-only">Loading…</span>
                  <div className="h-4 w-16 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="mb-12 self-end md:mb-[3.01rem]" role="status">
                  <span className="sr-only">Loading…</span>
                  <div className="h-4 w-20 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="mb-12 self-start md:mb-[3.01rem]" role="status">
                  <span className="sr-only">Loading…</span>
                  <div className="h-4 w-40 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="self-start" role="status">
                  <span className="sr-only">Loading…</span>
                  <div className="h-4 w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
              </div>
            )}
            {messages?.length && !messagesIsPending ? (
              messages.map((message, index) => {
                const showAvatar =
                  index === messages.length - 1 ||
                  message.userId !== messages[index + 1].userId;

                const messageMargin =
                  message.userId !== messages[index - 1]?.userId
                    ? "mt-4 mb-2"
                    : "";

                return (
                  <li
                    key={message.id}
                    className={`${messageMargin} ${
                      message.userId === session.id ? "self-end" : "self-start"
                    }`}
                  >
                    <div className="flex items-end justify-end gap-2">
                      {message.userId !== session.id && showAvatar ? (
                        <Image
                          src={message.userImage}
                          alt={`${message.userName}'s avatar`}
                          width={32}
                          height={32}
                          className="mb-1 h-8 w-8 flex-shrink-0 rounded-full object-contain"
                        />
                      ) : message.userId !== session.id && !showAvatar ? (
                        <div className="mb-1 h-8 w-8 flex-shrink-0 rounded-full"></div>
                      ) : null}
                      <div>
                        {message.userId !== session.id &&
                          message.userId !== messages[index - 1]?.userId && (
                            <p className="mb-1 text-xs font-semibold">
                              {message.userName}
                            </p>
                          )}
                        {message.message && (
                          <ReactLinkify
                            componentDecorator={captionLinksDecorator}
                          >
                            <div
                              className={`max-w-full whitespace-pre-line rounded-lg px-3 py-2 ${message.userId === session.id ? "bg-[#dbe4ff]" : "border border-[#dddfe6]"}`}
                            >
                              <p className={`max-w-full whitespace-pre-line`}>
                                {message.message}
                              </p>
                              <p
                                className={`mt-1 text-nowrap text-xs font-medium text-[#616572] ${session.id === message.userId ? "text-left" : "text-right"}`}
                              >
                                {formatMessageDate(message.createdAt)}
                              </p>
                            </div>
                          </ReactLinkify>
                        )}
                        {message.attachments.length
                          ? message.attachments.map((attachment) => {
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
                                      width={250}
                                      height={250}
                                      className="w-[10rem] rounded-md object-cover md:w-[15rem]"
                                    />
                                  </div>
                                );
                              } else
                                return (
                                  <ul key={attachment} className="mt-2">
                                    <AttachmentFileCard
                                      file={attachment}
                                      index={index}
                                      type="curFile"
                                      location="stream"
                                      isLoading={false}
                                    />
                                  </ul>
                                );
                            })
                          : null}
                      </div>
                    </div>
                  </li>
                );
              })
            ) : !messagesIsPending && !messages?.length ? (
              <li className="flex items-center justify-center">
                No messages has been sent yet.
              </li>
            ) : null}
            <li ref={messagesEndRef} className="h-0 w-0"></li>
          </ul>
          <div className="fixed bottom-3 left-3 right-3 z-10 bg-[#edf2ff] pt-2 md:absolute md:bottom-0 md:left-0 md:right-0 md:w-full md:bg-[#f3f6ff] md:pt-0">
            {attachmentNames.length ? (
              <>
                <div className="flex justify-between border-t border-[#dddfe6] pt-2">
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
                    className="flex cursor-pointer items-center gap-1 rounded-md border border-[#dddfe6] bg-[#f5f8ff] p-3 shadow-sm md:p-4"
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
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
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
                  className={`comment__form flex w-full rounded-md border border-[#dddfe6] ${message.length > 50 ? "items-end" : "items-center"}`}
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
        <div className="modal__container">
          <button
            type="button"
            className="absolute right-2 top-2"
            onClick={closeZoomedImage}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-6 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div
            className="flex max-h-full max-w-full items-center justify-center"
            ref={zoomedImageWrapperRef}
          >
            <Image
              src={zoomedImage}
              alt={zoomedImage}
              width={500}
              height={500}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
