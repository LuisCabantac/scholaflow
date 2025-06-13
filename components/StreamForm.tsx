"use client";

import Image from "next/image";
import { toast } from "sonner";
import { LinkIcon, Upload, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";

import {
  Classroom,
  ClassTopic,
  EnrolledClass,
  Session,
  Stream,
} from "@/lib/schema";
import {
  createClassStreamPost,
  updateClassStreamPost,
} from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import AttachmentFileCard from "@/components/AttachmentFileCard";
import AttachmentLinkCard from "@/components/AttachmentLinkCard";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function StreamForm({
  topics,
  search,
  stream,
  session,
  formType,
  classroom,
  streamType,
  enrolledClasses,
  onSetShowStreamForm,
  onToggleShowStreamForm,
}: {
  topics: ClassTopic[] | null;
  search?: string;
  stream?: Stream;
  session: Session;
  formType: "create" | "edit";
  classroom: Classroom;
  streamType?: "stream" | "assignment" | "quiz" | "question" | "material";
  enrolledClasses: EnrolledClass[] | null;
  onSetShowStreamForm: Dispatch<SetStateAction<boolean>>;
  onToggleShowStreamForm: () => void;
}) {
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const streamFormModalWrapperRef = useRef<HTMLDivElement>(null);
  const selectUsersModalWrapperRef = useRef<HTMLDivElement>(null);
  const addLinkModalWrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audience, setAudience] = useState<string[]>(
    stream?.announceTo ?? enrolledClasses?.map((user) => user.userId) ?? [],
  );
  const [showSelectUsersModal, setShowSelectUsersModal] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(
    stream?.attachments ?? [],
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
    stream?.dueDate ? "true" : "false",
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    stream?.dueDate ? new Date(stream.dueDate) : undefined,
  );
  const [dueDatePickerIsOpen, setDueDatePickerIsOpen] = useState(false);
  const [showDueDateDropdown, setShowDueDateDropdown] = useState(false);
  const [isAcceptingSubmissions, setIsAcceptingSubmissions] = useState<boolean>(
    stream?.acceptingSubmissions ?? true,
  );
  const [closeSubmissions, setCloseSubmissions] = useState<boolean>(
    stream?.closeSubmissionsAfterDueDate ?? false,
  );
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    stream?.scheduledAt ? new Date(stream.scheduledAt) : undefined,
  );
  const [scheduledDatePickerIsOpen, setScheduledDatePickerIsOpen] =
    useState(false);
  const [topicId, setTopicId] = useState(stream?.topicId ?? "no-topic");
  const [topicName, setTopicName] = useState(stream?.topicName ?? "no-topic");
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  const [safeInteractionPeriod, setSafeInteractionPeriod] = useState(false);

  async function handleSubmitStream(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    newUrlLinks.forEach((link) => formData.append("links", link));
    newAttachments.forEach((attachment) =>
      formData.append("attachments", attachment),
    );
    if (scheduledDate) {
      formData.append("scheduledAt", scheduledDate.toISOString());
    }
    if (dueDate) {
      formData.append("dueDate", dueDate.toISOString());
    }
    if (topicId) {
      formData.append("topicId", topicId);
    }

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
      queryClient.invalidateQueries({
        queryKey: [`classworks--${classroom.id}`, search],
      });
      queryClient.invalidateQueries({
        queryKey: [`streams--${classroom.id}`, search],
      });
      queryClient.invalidateQueries({
        queryKey: [`topics--${classroom.id}`, , search],
      });
      onToggleShowStreamForm();
    } else toast.error(message);
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

  function setSafeInteraction(duration = 300) {
    setSafeInteractionPeriod(true);
    setTimeout(() => setSafeInteractionPeriod(false), duration);
  }

  function handleGradeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = event.target.value;
    if (/^\d*$/.test(inputValue)) {
      if (inputValue.length > 1 && inputValue.startsWith("0")) {
        const numericValue = String(parseInt(inputValue, 10));
        setGrade(numericValue);
      } else {
        setGrade(inputValue);
      }
    }
  }

  function handleGradeBlur() {
    if ((grade === "" || Number(grade) === 0) && isGraded === "true") {
      setGrade("100");
    }
  }

  useClickOutsideHandler(
    streamFormModalWrapperRef,
    () => {
      if (!safeInteractionPeriod) {
        onSetShowStreamForm(false);
      }
    },
    isLoading ||
      scheduledDatePickerIsOpen ||
      dueDatePickerIsOpen ||
      showGradeDropdown ||
      showDueDateDropdown ||
      showTopicDropdown ||
      safeInteractionPeriod,
  );

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
      <AnimatePresence>
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-10 h-[95%] overflow-y-scroll rounded-t-2xl border-t bg-card"
          ref={streamFormModalWrapperRef}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{
            type: "spring",
            damping: 32,
            stiffness: 300,
            mass: 1,
            duration: 0.2,
          }}
        >
          <form
            className="relative min-h-screen w-full pb-[6rem]"
            onSubmit={handleSubmitStream}
          >
            <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                {formType === "edit" && stream ? "Edit " : "Create "}
                {streamType === "stream" ? "post" : (streamType ?? "")}
              </h3>
              <Button
                className="hover:bg-transparent disabled:cursor-not-allowed"
                variant="ghost"
                type="button"
                size="icon"
                disabled={isLoading}
                onClick={onToggleShowStreamForm}
              >
                <X className="size-5 stroke-foreground" />
              </Button>
            </div>
            <div
              className={`grid px-4 pb-4 md:gap-4 md:px-8 md:pb-8 ${streamType !== "stream" && "md:grid-cols-2"}`}
            >
              <div className="flex flex-col justify-start gap-3">
                <input
                  type="text"
                  name="classroomId"
                  defaultValue={stream?.classId ?? classroom.id}
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
                {session.id === classroom.teacherId && (
                  <div className="flex flex-col items-start justify-start gap-2">
                    <Label>Assign to</Label>
                    <button
                      onClick={handleToggleShowSelectUsersModal}
                      type="button"
                      disabled={isLoading}
                      className="w-full rounded-xl border bg-foreground/10 px-4 py-2 text-start focus:border-primary focus:outline-none disabled:text-foreground"
                    >
                      {enrolledClasses?.length === audience.length
                        ? "All users"
                        : `${audience.length} user${audience.length > 1 ? "s" : ""} selected`}
                    </button>
                    {showSelectUsersModal && (
                      <div className="modal__container">
                        <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
                          <Card
                            className="md:w-[25rem]"
                            ref={selectUsersModalWrapperRef}
                          >
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium tracking-tight text-foreground">
                                  Assign to
                                </h3>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-transparent"
                                  disabled={isLoading}
                                  onClick={handleToggleShowSelectUsersModal}
                                >
                                  <X className="stroke-foreground" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-4">
                                <ul className="grid gap-2">
                                  <li>
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                      <Checkbox
                                        disabled={isLoading}
                                        checked={
                                          enrolledClasses?.length ===
                                          audience.length
                                        }
                                        onCheckedChange={(checked) => {
                                          if (checked) {
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
                                      <label className="flex items-center gap-2 text-sm font-medium">
                                        <Checkbox
                                          disabled={isLoading}
                                          checked={audience.includes(
                                            user.userId,
                                          )}
                                          onCheckedChange={(checked) => {
                                            if (checked) {
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
                                        <Image
                                          src={user.userImage}
                                          alt={`${user.userName}'s image`}
                                          width={24}
                                          height={24}
                                          className="h-6 w-6 rounded-full"
                                        />
                                        {user.userName}
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <Button
                                  type="button"
                                  onClick={handleToggleShowSelectUsersModal}
                                >
                                  Done
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {streamType !== "stream" && (
                  <div className="grid gap-2">
                    <Label htmlFor="title">
                      Title <span className="text-destructive"> *</span>
                    </Label>
                    <Input
                      type="text"
                      required
                      disabled={isLoading}
                      name="title"
                      defaultValue={stream?.title ?? ""}
                      placeholder="Add a descriptive title"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <label className="font-medium">
                    {streamType === "stream" && "Caption"}
                    {(streamType === "quiz" || streamType === "assignment") &&
                      "Instructions"}
                    {streamType === "material" && "Description"}
                    {streamType === "stream" && (
                      <span className="text-destructive"> *</span>
                    )}
                  </label>
                  <Textarea
                    required={streamType === "stream"}
                    name="caption"
                    placeholder="Add relevant details or instructions"
                    className="h-[10rem] w-full resize-none rounded-xl bg-foreground/10 px-4 py-2"
                    disabled={isLoading}
                    defaultValue={stream?.content ?? ""}
                  />
                </div>
                {session.id === classroom.teacherId &&
                  streamType === "stream" && (
                    <div className="grid gap-2">
                      <Label htmlFor="date">Schedule post</Label>
                      <DateTimePicker
                        disabled={isLoading}
                        showLabels={false}
                        date={scheduledDate}
                        onSetDate={setScheduledDate}
                        datePickerIsOpen={scheduledDatePickerIsOpen}
                        onSetDatePickerIsOpen={setScheduledDatePickerIsOpen}
                      />
                    </div>
                  )}
                <div className="grid gap-2">
                  {currentAttachments.length || attachmentNames.length ? (
                    <label className="font-medium">Files</label>
                  ) : null}
                  <ul className="grid gap-1 overflow-y-auto">
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
                <div className="mb-2 grid gap-2">
                  {currentUrlLinks.length || newUrlLinks.length ? (
                    <label className="font-medium">Links</label>
                  ) : null}
                  <ul className="grid gap-1 overflow-y-auto">
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
                  {streamType !== "material" && (
                    <>
                      <div className="grid gap-2">
                        <Label>Points</Label>
                        <div
                          className={`grid gap-2 ${isGraded === "true" ? "grid-cols-2" : ""}`}
                        >
                          <DropdownMenu
                            onOpenChange={(open) => {
                              setShowGradeDropdown(open);
                              setSafeInteraction();
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <button
                                className={
                                  "rounded-xl border bg-foreground/10 px-4 py-2 text-start focus:border-primary focus:outline-none disabled:text-foreground"
                                }
                                disabled={isLoading}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSafeInteraction();
                                }}
                              >
                                {isGraded === "true" ? "Graded" : "Ungraded"}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="z-[1100]"
                              align="start"
                            >
                              <DropdownMenuItem
                                textValue="graded"
                                onClick={() => {
                                  setIsGraded("true");
                                  setSafeInteraction();
                                }}
                              >
                                Graded
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                textValue="ungraded"
                                onClick={() => {
                                  setIsGraded("false");
                                  setSafeInteraction();
                                }}
                              >
                                Ungraded
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {isGraded === "true" && (
                            <Input
                              type="number"
                              name="totalPoints"
                              value={grade}
                              onChange={handleGradeChange}
                              onBlur={handleGradeBlur}
                              disabled={isLoading}
                            />
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Due Date</Label>
                        <div className="grid gap-2">
                          <DropdownMenu
                            onOpenChange={(open) => {
                              setShowDueDateDropdown(open);
                              setSafeInteraction();
                            }}
                          >
                            <DropdownMenuTrigger asChild>
                              <button
                                className={
                                  "rounded-xl border bg-foreground/10 px-4 py-2 text-start focus:border-primary focus:outline-none disabled:text-foreground"
                                }
                                disabled={isLoading}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSafeInteraction();
                                }}
                              >
                                {hasDueDate === "true"
                                  ? "Due Date"
                                  : "No Due Date"}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="z-[1100]"
                              align="start"
                            >
                              <DropdownMenuItem
                                textValue="dueDate"
                                onClick={() => {
                                  setHasDueDate("true");
                                  setSafeInteraction();
                                }}
                              >
                                Due Date
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                textValue="noDueDate"
                                onClick={() => {
                                  setHasDueDate("false");
                                  setSafeInteraction();
                                }}
                              >
                                No Due Date
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {hasDueDate === "true" && (
                            <div className="w-full">
                              <DateTimePicker
                                disabled={isLoading}
                                showLabels={true}
                                date={dueDate}
                                onSetDate={setDueDate}
                                datePickerIsOpen={dueDatePickerIsOpen}
                                onSetDatePickerIsOpen={setDueDatePickerIsOpen}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="grid gap-2">
                    <Label>Topic</Label>
                    <DropdownMenu
                      onOpenChange={(open) => {
                        setShowTopicDropdown(open);
                        setSafeInteraction();
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <button
                          className={
                            "w-full rounded-xl border bg-foreground/10 px-4 py-2 text-start focus:border-primary focus:outline-none disabled:text-foreground"
                          }
                          disabled={isLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSafeInteraction();
                          }}
                        >
                          {topicName === "no-topic" ? "No Topic" : topicName}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="z-[1100]" align="start">
                        <DropdownMenuItem
                          textValue="no-topic"
                          onClick={() => {
                            setTopicId("no-topic");
                            setTopicName("no-topic");
                            setSafeInteraction();
                          }}
                        >
                          No Topic
                        </DropdownMenuItem>
                        {topics?.map((topic) => (
                          <DropdownMenuItem
                            key={topic.id}
                            textValue={topic.name}
                            onClick={() => {
                              setTopicId(topic.id);
                              setTopicName(topic.name);
                              setSafeInteraction();
                            }}
                          >
                            {topic.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Schedule {streamType}</Label>
                    <DateTimePicker
                      disabled={isLoading}
                      showLabels={false}
                      date={scheduledDate}
                      onSetDate={setScheduledDate}
                      datePickerIsOpen={scheduledDatePickerIsOpen}
                      onSetDatePickerIsOpen={setScheduledDatePickerIsOpen}
                    />
                  </div>
                  {streamType !== "material" && (
                    <>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <Checkbox
                            name="acceptingSubmissions"
                            disabled={isLoading}
                            value={isAcceptingSubmissions.toString()}
                            checked={isAcceptingSubmissions}
                            onCheckedChange={(check) =>
                              setIsAcceptingSubmissions(check === true)
                            }
                          />
                          <span>Accepting submissions</span>
                        </Label>
                      </div>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <Checkbox
                            name="closeSubmissionsAfterDueDate"
                            disabled={isLoading}
                            value={closeSubmissions.toString()}
                            checked={closeSubmissions}
                            onCheckedChange={(check) =>
                              setCloseSubmissions(check === true)
                            }
                          />
                          <span>Close submissions after due date</span>
                        </Label>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="fixed bottom-0 left-0 right-0 flex w-auto items-center justify-end gap-2 border-t bg-card px-4 py-4 md:px-8">
              <div className="mr-2 flex items-start gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isLoading}
                  asChild
                >
                  <label className="cursor-pointer disabled:cursor-not-allowed">
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
                    <Upload className="size-4 stroke-foreground md:size-5" />
                  </label>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleShowAddLinkModal}
                  disabled={isLoading}
                >
                  <LinkIcon className="size-4 stroke-foreground md:size-5" />
                </Button>
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
                      <Card
                        className="md:w-[25rem]"
                        ref={addLinkModalWrapperRef}
                      >
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
              </div>
              {!isLoading && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onToggleShowStreamForm}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {formType === "edit" ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
