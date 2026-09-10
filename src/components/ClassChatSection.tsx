"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import ReactLinkify from "react-linkify";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ImagePlus, SendHorizontal } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { Chat, Session } from "@/lib/schema";
import { addMessageToChat } from "@/lib/classroom-actions";
import { formatMessageDate, getFileExtension } from "@/lib/utils";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import AttachmentFileCard from "@/components/AttachmentFileCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextareaAutosize } from "@/components/ui/textarea-autosize";

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
      const maxFileSize = 5 * 1024 * 1024;

      const validFiles = files.filter((file) => {
        if (file.size > maxFileSize) {
          toast.error(`File ${file.name} exceeds 5MB limit`);
          return false;
        }
        return true;
      });

      setNewAttachments((prevFiles) => [...prevFiles, ...validFiles]);
    }
  }

  function handleAttachmentNameChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = event.target.files;
    if (files) {
      const maxFileSize = 5 * 1024 * 1024;
      const validFileNames = Array.from(files)
        .filter((file) => file.size <= maxFileSize)
        .map((file) => file.name);

      setAttachmentNames(validFileNames);
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
        className="break-words text-ring underline"
      >
        {text}
      </a>
    );
  }

  return (
    <section className="relative">
      <div className="flex items-center justify-between pb-2">
        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="stream" asChild>
              <Link href={`/classroom/class/${classId}`}>Stream</Link>
            </TabsTrigger>
            <TabsTrigger value="classwork" asChild>
              <Link href={`/classroom/class/${classId}/classwork`}>
                Classwork
              </Link>
            </TabsTrigger>
            <TabsTrigger value="people" asChild>
              <Link href={`/classroom/class/${classId}/people`}>People</Link>
            </TabsTrigger>
            <TabsTrigger value="chat" asChild>
              <Link href={`/classroom/class/${classId}/chat`}>Chat</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex w-full flex-col rounded-md md:border md:bg-card md:p-4">
        <div className={`relative ${message.length > 50 ? "pb-40" : "pb-16"}`}>
          <ul className="flex h-[75dvh] flex-col gap-2 overflow-y-auto rounded-md md:h-[75dvh]">
            {messagesIsPending && !messages && (
              <>
                <div className="flex-1"></div>
                <div className="flex min-h-full flex-col justify-end">
                  <li className="mb-12 self-end md:mb-[3.01rem]" role="status">
                    <span className="sr-only">Loading…</span>
                    <div className="h-4 w-40 animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li
                    className="mb-12 self-start md:mb-[3.01rem]"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="h-4 w-60 animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li
                    className="mb-12 self-start md:mb-[3.01rem]"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="h-4 w-60 animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li
                    className="mb-12 self-start md:mb-[3.01rem]"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="h-4 w-28 animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li
                    className="mb-12 self-start md:mb-[3.01rem]"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="h-4 w-32 animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li className="mb-12 self-end md:mb-[3.01rem]" role="status">
                    <span className="sr-only">Loading…</span>
                    <div className="h-4 w-56 animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li className="mb-12 self-end md:mb-[3.01rem]" role="status">
                    <span className="sr-only">Loading…</span>
                    <div className="h-4 w-16 animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li className="mb-12 self-end md:mb-[3.01rem]" role="status">
                    <span className="sr-only">Loading…</span>
                    <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li
                    className="mb-12 self-start md:mb-[3.01rem]"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="h-4 w-40 animate-pulse rounded-md bg-muted"></div>
                  </li>
                  <li className="self-start" role="status">
                    <span className="sr-only">Loading…</span>
                    <div className="h-4 w-36 animate-pulse rounded-md bg-muted"></div>
                  </li>
                </div>
              </>
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
                    } max-w-[85%] sm:max-w-[75%]`}
                  >
                    <div className="flex max-w-full items-end gap-2">
                      {message.userId !== session.id && showAvatar ? (
                        <Image
                          src={message.userImage}
                          alt={`${message.userName}'s avatar`}
                          width={32}
                          height={32}
                          onDragStart={(e) => e.preventDefault()}
                          className="mb-1 h-8 w-8 flex-shrink-0 rounded-full object-contain"
                        />
                      ) : message.userId !== session.id && !showAvatar ? (
                        <div className="mb-1 h-8 w-8 flex-shrink-0 rounded-full"></div>
                      ) : null}
                      <div className="min-w-0 flex-1">
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
                              className={`overflow-hidden whitespace-pre-line break-words rounded-lg px-3 py-2 ${message.userId === session.id ? "bg-card md:bg-foreground/10" : "border"}`}
                            >
                              <p className="overflow-hidden whitespace-pre-line break-words text-foreground/90">
                                {message.message}
                              </p>
                              <p
                                className={`mt-1 select-none text-nowrap text-xs font-medium text-foreground/70 ${session.id === message.userId ? "text-left" : "text-right"}`}
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
                                      className="w-[10rem] rounded-xl object-cover md:w-[15rem]"
                                      onDragStart={(e) => e.preventDefault()}
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
          <div className="fixed bottom-3 left-3 right-3 z-10 bg-background pt-2 md:absolute md:bottom-0 md:left-0 md:right-0 md:w-full md:bg-card md:pt-0">
            {attachmentNames.length ? (
              <>
                <div className="flex justify-between border-t pt-2">
                  <p className="font-medium">Attachments</p>
                  <button type="button" onClick={handleToggleExpandAttachments}>
                    <ChevronDown
                      strokeWidth={3}
                      className={`${expandAttachments ? "rotate-180" : "rotate-0"} w-6 transition-transform`}
                    />
                  </button>
                </div>
                {!expandAttachments && (
                  <div
                    className="flex cursor-pointer items-center gap-1 rounded-xl border p-3 shadow-sm md:p-4"
                    onClick={handleToggleExpandAttachments}
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
                  <ImagePlus className="size-5 md:size-6" />
                </label>
                <div
                  className={`comment__form flex w-full gap-2 ${message.length > 50 ? "items-end" : "items-center"}`}
                >
                  <input
                    type="text"
                    name="classroomId"
                    defaultValue={classId}
                    hidden
                  />
                  <TextareaAutosize
                    name="message"
                    value={message}
                    className="resize-none"
                    minRows={1}
                    maxRows={6}
                    required={!newAttachments.length}
                    placeholder={
                      addMessageIsPending
                        ? "Adding your message..."
                        : "Add a message..."
                    }
                    disabled={addMessageIsPending}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                  <button
                    type="submit"
                    className="group py-2"
                    disabled={addMessageIsPending}
                  >
                    {addMessageIsPending ? (
                      <div className="spinner__mini dark"></div>
                    ) : (
                      <SendHorizontal className="size-6 stroke-primary group-disabled:opacity-50" />
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
              onDragStart={(event) => event.preventDefault()}
            />
          </div>
        </div>
      )}
    </section>
  );
}
