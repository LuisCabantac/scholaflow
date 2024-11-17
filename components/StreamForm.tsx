"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { ISession } from "@/lib/auth";
import {
  createClassStreamPost,
  updateClassStreamPost,
} from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import { IStream } from "@/app/user/classroom/class/[classId]/page";

import { IClass } from "@/components/ClassroomSection";
import Button from "@/components/Button";
import AttachmentFileCard from "@/components/AttachmentFileCard";
import AttachmentLinkCard from "@/components/AttachmentLinkCard";

export default function StreamForm({
  streamType,
  formType,
  stream,
  session,
  classroom,
  enrolledClasses,
  onToggleShowStreamForm,
}: {
  streamType?: "stream" | "assignment" | "quiz" | "question" | "material";
  formType: "create" | "edit";
  stream?: IStream;
  session: ISession;
  classroom: IClass;
  enrolledClasses: IClass[] | null;
  onToggleShowStreamForm: () => void;
}) {
  const router = useRouter();
  const { useClickOutsideHandler } = useClickOutside();
  const selectUsersModalWrapperRef = useRef<HTMLDivElement>(null);
  const addLinkModalWrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audience, setAudience] = useState<string[]>(
    stream?.announceTo ?? enrolledClasses?.map((user) => user.userId) ?? [],
  );
  const [showSelectUsersModal, setShowSelectUsersModal] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(
    stream?.attachment ?? [],
  );
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [currentUrlLinks, setCurrentUrlLinks] = useState<string[]>(
    stream?.links ?? [],
  );
  const [newUrlLinks, setNewUrlLinks] = useState<string[]>([]);
  const [url, setUrl] = useState<string>("");
  const [grade, setGrade] = useState(stream?.points ?? "100");
  const [isGraded, setIsGraded] = useState(stream?.points ? "true" : "false");
  const [hasDueDate, setHasDueDate] = useState<string>(
    stream?.hasDueDate === "true" ? "true" : "false",
  );
  const [dueDate, setDueDate] = useState(
    format(stream?.dueDate ?? new Date(), "yyyy-MM-dd'T'HH:mm") ===
      format("1970-01-01 00:00:00+00", "yyyy-MM-dd'T'HH:mm")
      ? format(new Date(), "yyyy-MM-dd'T'HH:mm")
      : format(stream?.dueDate ?? new Date(), "yyyy-MM-dd'T'HH:mm"),
  );
  // const [scheduledDate, setScheduledDate] = useState(
  //   format(stream?.scheduledTime ?? new Date(), "yyyy-MM-dd'T'HH:mm") ===
  //     format("1970-01-01 00:00:00+00", "yyyy-MM-dd'T'HH:mm")
  //     ? format(new Date(), "yyyy-MM-dd'T'HH:mm")
  //     : format(stream?.dueDate ?? new Date(), "yyyy-MM-dd'T'HH:mm"),
  // );
  const [isAcceptingSubmissions, setIsAcceptingSubmissions] = useState<boolean>(
    stream?.acceptingSubmissions ?? true,
  );
  const [closeSubmissions, setCloseSubmissions] = useState<boolean>(
    stream?.closeSubmissionsAfterDueDate ?? false,
  );

  async function handleSubmitStream(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    newUrlLinks.forEach((link) => formData.append("links", link));
    newAttachments.forEach((attachment) =>
      formData.append("attachments", attachment),
    );

    if (formType === "create")
      audience.forEach((person) => formData.append("announceTo", person));

    const { success, message } = await (formType === "create"
      ? createClassStreamPost(
          audience,
          audience.length === enrolledClasses?.length,
          formData,
        )
      : updateClassStreamPost(
          audience,
          audience.length === enrolledClasses?.length,
          currentUrlLinks,
          currentAttachments,
          formData,
        ));

    setIsLoading(false);
    if (success) {
      toast.success(message);
      onToggleShowStreamForm();
      router.refresh();
    } else toast.error(message);
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
      prevFiles.filter((_, i: number) => i !== index),
    );
  }

  function handleRemoveCurrentUrl(index: number) {
    setCurrentUrlLinks((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
  }

  function handleToggleShowSelectUsersModal() {
    setShowSelectUsersModal(!showSelectUsersModal);
  }

  function handleToggleShowAddLinkModal() {
    setShowAddLinkModal(!showAddLinkModal);
  }

  function handleGradeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = event.target.value;
    if (/^\d*$/.test(inputValue)) {
      setGrade(inputValue);
    }
  }

  function handleGradeBlur() {
    if ((grade === "" || Number(grade) === 0) && isGraded === "true") {
      setGrade("100");
    }
  }

  useClickOutsideHandler(
    selectUsersModalWrapperRef,
    () => {
      setShowSelectUsersModal(false);
    },
    isLoading,
  );

  useClickOutsideHandler(
    addLinkModalWrapperRef,
    () => {
      setShowAddLinkModal(false);
    },
    isLoading,
  );

  return (
    <div className="modal__container">
      <div className="flex h-[80%] w-[95%] items-center justify-center md:w-[80%]">
        <form
          className="w-full rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] shadow-sm"
          onSubmit={handleSubmitStream}
        >
          <div className="flex items-center px-4 py-4">
            <h3 className="text-lg font-medium md:text-xl">
              {formType === "edit" && stream ? "Edit " : "Create "}
              {streamType === "stream" ? "post" : (streamType ?? "")}
            </h3>
          </div>
          <div
            className={`grid gap-4 px-4 pb-4 ${streamType !== "stream" && "md:grid-cols-2"}`}
          >
            <div className="flex flex-col justify-start gap-3">
              <input
                type="text"
                name="classroomId"
                defaultValue={stream?.classroomId ?? classroom.classroomId}
                hidden
              />
              <input
                type="text"
                name="streamType"
                defaultValue={stream?.type ?? streamType}
                hidden
              />
              <input
                type="text"
                name="streamId"
                defaultValue={stream?.id ?? ""}
                hidden
              />
              <input
                type="text"
                name="hasDueDate"
                defaultValue={stream?.hasDueDate ?? hasDueDate}
                hidden
              />
              {session.user.role === "teacher" &&
              session.user.id === classroom.teacherId &&
              streamType === "stream" ? (
                <div className="flex flex-col items-start justify-start gap-2">
                  <label className="text-xs font-medium md:text-sm">
                    Assign to
                  </label>
                  <button
                    onClick={handleToggleShowSelectUsersModal}
                    type="button"
                    disabled={isLoading}
                    className="w-full rounded-md border-2 border-[#dbe4ff] px-4 py-2 text-start text-sm focus:border-[#384689] focus:outline-none disabled:text-[#616572] md:px-5 md:py-3 md:text-base"
                  >
                    {enrolledClasses?.length === audience.length
                      ? "All users"
                      : `${audience.length} user${audience.length > 1 ? "s" : ""} selected`}
                  </button>
                  {showSelectUsersModal && (
                    <div className="modal__container">
                      <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
                        <div
                          className="grid w-full gap-2 rounded-md bg-[#f3f6ff] p-4 md:w-[25rem]"
                          ref={selectUsersModalWrapperRef}
                        >
                          <div className="grid gap-2">
                            <h4 className="text-lg font-medium">Announce to</h4>

                            <ul className="grid gap-2">
                              <li>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    defaultChecked={
                                      stream?.announceToAll ?? true
                                    }
                                    checked={
                                      enrolledClasses?.length ===
                                      audience.length
                                    }
                                    className="size-4 rounded-md checked:accent-[#384689]"
                                    onChange={(event) => {
                                      if (event.target.checked) {
                                        setAudience(
                                          enrolledClasses?.map(
                                            (user) => user.userId,
                                          ) ?? [],
                                        );
                                      } else {
                                        setAudience([]);
                                      }
                                    }}
                                  />
                                  All users
                                </label>
                              </li>
                              {enrolledClasses?.map((user) => (
                                <li key={user.id}>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={audience.includes(user.userId)}
                                      className="size-4 rounded-md checked:accent-[#384689]"
                                      onChange={(event) => {
                                        if (event.target.checked) {
                                          setAudience([
                                            ...audience,
                                            user.userId,
                                          ]);
                                        } else {
                                          setAudience(
                                            audience.filter(
                                              (people) =>
                                                people !== user.userId,
                                            ),
                                          );
                                        }
                                      }}
                                    />
                                    <div className="relative h-6 w-6">
                                      <Image
                                        src={user.userAvatar}
                                        alt={`${user.userName}'s image`}
                                        fill
                                        className="rounded-full"
                                      />
                                    </div>
                                    {user.userName}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="primary"
                              onClick={handleToggleShowSelectUsersModal}
                            >
                              Done
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
              {streamType !== "stream" && (
                <div className="grid gap-2">
                  <label className="text-xs font-medium md:text-sm">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    disabled={isLoading}
                    name="title"
                    type="text"
                    defaultValue={stream?.title ?? ""}
                    placeholder="Add a descriptive title"
                    className="rounded-md border-2 border-[#dbe4ff] bg-transparent px-5 py-3 text-sm placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] md:text-base"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <label className="text-xs font-medium md:text-sm">
                  {streamType === "stream" && "Caption"}
                  {(streamType === "quiz" || streamType === "assignment") &&
                    "Instructions"}
                  {streamType === "material" && "Description"}
                  {streamType === "stream" && (
                    <span className="text-red-400"> *</span>
                  )}
                </label>
                <textarea
                  required={streamType === "stream"}
                  name="caption"
                  className="h-[5rem] w-full resize-none rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 text-sm placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] md:h-[8rem] md:px-5 md:py-3 md:text-base"
                  placeholder="Add relevant details or instructions"
                  disabled={isLoading}
                  defaultValue={stream?.caption ?? ""}
                ></textarea>
              </div>
              <div className="flex gap-2 md:gap-4">
                <label className="input__file__label flex cursor-pointer gap-1">
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
                    className="size-4 stroke-[#616572] md:size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p className="text-xs font-medium md:text-sm">Upload files</p>
                </label>
                <label className="flex gap-1">
                  <button
                    onClick={handleToggleShowAddLinkModal}
                    className="flex gap-1"
                    type="button"
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="size-4 stroke-[#616572] md:size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                      />
                    </svg>
                    <p className="text-xs font-medium md:text-sm">Add links</p>
                  </button>
                </label>
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
                          <Button
                            type="secondary"
                            onClick={handleToggleShowAddLinkModal}
                          >
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
              </div>
              <div className="grid gap-2">
                {currentAttachments.length || attachmentNames.length ? (
                  <label className="text-xs font-medium md:text-sm">
                    Files
                  </label>
                ) : null}
                <ul className="grid max-h-20 gap-1 overflow-y-auto">
                  {attachmentNames.length
                    ? attachmentNames.map((file, index) => (
                        <AttachmentFileCard
                          file={file}
                          index={index}
                          type="newFile"
                          location="form"
                          isLoading={isLoading}
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
                          isLoading={isLoading}
                          onRemoveAttachment={handleRemoveCurrentAttachment}
                          key={file}
                        />
                      ))
                    : null}
                </ul>
              </div>
              <div className="grid gap-2">
                {currentUrlLinks.length || newUrlLinks.length ? (
                  <label className="text-xs font-medium md:text-sm">
                    Links
                  </label>
                ) : null}
                <ul className="grid max-h-20 gap-1 overflow-y-auto">
                  {newUrlLinks.length
                    ? newUrlLinks.map((link, index) => (
                        <AttachmentLinkCard
                          link={link}
                          index={index}
                          location="form"
                          isLoading={isLoading}
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
                          isLoading={isLoading}
                          onRemoveAttachment={handleRemoveCurrentUrl}
                          key={link}
                        />
                      ))
                    : null}
                </ul>
              </div>
            </div>
            {streamType !== "stream" && (
              <div className="flex flex-col gap-3">
                {session.user.role === "teacher" &&
                session.user.id === classroom.teacherId ? (
                  <div className="flex flex-col items-start justify-start gap-2">
                    <label className="text-xs font-medium md:text-sm">
                      Assign to
                    </label>
                    <button
                      onClick={handleToggleShowSelectUsersModal}
                      type="button"
                      disabled={isLoading}
                      className="w-full rounded-md border-2 border-[#dbe4ff] px-4 py-2 text-start text-sm focus:border-[#384689] focus:outline-none disabled:text-[#616572] md:px-5 md:py-3 md:text-base"
                    >
                      {enrolledClasses?.length === audience.length
                        ? "All users"
                        : `${audience.length} user${audience.length > 1 ? "s" : ""} selected`}
                    </button>
                    {showSelectUsersModal && (
                      <div className="modal__container">
                        <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
                          <div
                            className="grid w-full gap-2 rounded-md bg-[#f3f6ff] p-4 md:w-[25rem]"
                            ref={selectUsersModalWrapperRef}
                          >
                            <div className="grid gap-2">
                              <h4 className="text-lg font-medium">
                                Announce to
                              </h4>

                              <ul className="grid gap-2">
                                <li>
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      defaultChecked={
                                        stream?.announceToAll ?? true
                                      }
                                      checked={
                                        enrolledClasses?.length ===
                                        audience.length
                                      }
                                      className="size-4 rounded-md checked:accent-[#384689]"
                                      onChange={(event) => {
                                        if (event.target.checked) {
                                          setAudience(
                                            enrolledClasses?.map(
                                              (user) => user.userId,
                                            ) ?? [],
                                          );
                                        } else {
                                          setAudience([]);
                                        }
                                      }}
                                    />
                                    All users
                                  </label>
                                </li>
                                {enrolledClasses?.map((user) => (
                                  <li key={user.id}>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={audience.includes(user.userId)}
                                        className="size-4 rounded-md checked:accent-[#384689]"
                                        onChange={(event) => {
                                          if (event.target.checked) {
                                            setAudience([
                                              ...audience,
                                              user.userId,
                                            ]);
                                          } else {
                                            setAudience(
                                              audience.filter(
                                                (people) =>
                                                  people !== user.userId,
                                              ),
                                            );
                                          }
                                        }}
                                      />
                                      <div className="relative h-6 w-6">
                                        <Image
                                          src={user.userAvatar}
                                          alt={`${user.userName}'s image`}
                                          fill
                                          className="rounded-full"
                                        />
                                      </div>
                                      {user.userName}
                                    </label>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                type="primary"
                                onClick={handleToggleShowSelectUsersModal}
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
                {streamType !== "material" && (
                  <>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium md:text-sm">
                        Points
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-full">
                          <select
                            disabled={isLoading}
                            name="levels"
                            className="level__select w-full cursor-pointer rounded-md border-2 border-[#dbe4ff] px-4 py-2 text-sm focus:border-[#384689] focus:outline-none disabled:text-[#616572] md:px-5 md:py-3 md:text-base"
                            onChange={(event) =>
                              setIsGraded(event.target.value)
                            }
                            value={isGraded}
                          >
                            <option value="true">Graded</option>
                            <option value="false">Ungraded</option>
                          </select>
                        </div>
                        {isGraded === "true" && (
                          <input
                            type="number"
                            name="totalPoints"
                            className="rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 text-sm focus:border-[#384689] focus:outline-none disabled:text-[#616572] md:px-5 md:py-3 md:text-base"
                            value={grade}
                            defaultValue="100"
                            onChange={handleGradeChange}
                            onBlur={handleGradeBlur}
                            disabled={isLoading}
                          />
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-medium md:text-sm">
                        Due date
                      </label>
                      <div className="flex gap-2">
                        <div className="relative w-full">
                          <select
                            disabled={isLoading}
                            className="level__select w-full cursor-pointer rounded-md border-2 border-[#dbe4ff] px-4 py-2 text-sm focus:border-[#384689] focus:outline-none disabled:text-[#616572] md:px-5 md:py-3 md:text-base"
                            onChange={(event) =>
                              setHasDueDate(event.target.value)
                            }
                            value={hasDueDate}
                          >
                            <option value="true">Due date</option>
                            <option value="false">No due date</option>
                          </select>
                        </div>
                        {hasDueDate === "true" && (
                          <input
                            type="datetime-local"
                            disabled={isLoading}
                            name="dueDate"
                            className="rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 text-sm focus:border-[#384689] focus:outline-none disabled:text-[#616572] md:px-5 md:py-3 md:text-base"
                            value={dueDate}
                            onChange={(event) => setDueDate(event.target.value)}
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div className="grid gap-2">
                  <label className="text-xs font-medium md:text-sm">
                    Topic
                  </label>
                  <div className="relative w-full">
                    <select
                      disabled={isLoading}
                      name="topic"
                      className="level__select w-full cursor-pointer rounded-md border-2 border-[#dbe4ff] px-4 py-2 text-sm focus:border-[#384689] focus:outline-none md:px-5 md:py-3 md:text-base"
                    >
                      <option value="no-topic">No topic</option>
                      <option value="false">Topic</option>
                    </select>
                  </div>
                </div>
                {streamType !== "material" && (
                  <>
                    <div className="grid gap-2">
                      <label className="flex gap-2 text-xs font-medium md:text-sm">
                        <input
                          type="checkbox"
                          name="acceptingSubmissions"
                          className="checked:accent-[#384689]"
                          value={isAcceptingSubmissions.toString()}
                          checked={isAcceptingSubmissions}
                          onChange={(event) =>
                            setIsAcceptingSubmissions(event.target.checked)
                          }
                          disabled={isLoading}
                        />
                        <span>Accepting submissions</span>
                      </label>
                    </div>
                    <div className="grid gap-2">
                      <label className="flex gap-2 text-xs font-medium md:text-sm">
                        <input
                          type="checkbox"
                          name="closeSubmissionsAfterDueDate"
                          className="checked:accent-[#384689]"
                          value={closeSubmissions.toString()}
                          checked={closeSubmissions}
                          onChange={(event) =>
                            setCloseSubmissions(event.target.checked)
                          }
                          disabled={isLoading}
                        />
                        <span>Close submissions after due date</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="mx-3 mb-3 mt-2 flex items-center justify-end gap-2 md:mx-4 md:mb-4">
            {!isLoading && (
              <Button type="secondary" onClick={onToggleShowStreamForm}>
                Cancel
              </Button>
            )}
            <Button type="primary" isLoading={isLoading}>
              {formType === "edit" ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}