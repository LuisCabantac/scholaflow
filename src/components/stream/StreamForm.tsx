import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LinkIcon, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import { isWebUrl } from "@/lib/links";
import { streamKeys } from "@/queries/stream";
import type { SessionUser } from "@/types/auth";
import { classworkKeys } from "@/queries/classwork";
import type { StreamFormType } from "@/types/stream";
import { classTopicKeys } from "@/queries/class-topic";
import { useClickOutside } from "@/hooks/use-click-outside";
import { createStreamFn, updateStreamFn } from "@/server/functions/stream";
import type {
  Classroom,
  ClassTopic,
  EnrolledClass,
  Stream,
  StreamType,
} from "@/lib/schema";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AttachmentFileCard from "@/components/shared/AttachmentFileCard";
import AttachmentLinkCard from "@/components/shared/AttachmentLinkCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const titleKeys = {
  stream: { create: "createStream", edit: "editStream" },
  assignment: { create: "createAssignment", edit: "editAssignment" },
  quiz: { create: "createQuiz", edit: "editQuiz" },
  question: { create: "createQuestion", edit: "editQuestion" },
  material: { create: "createMaterial", edit: "editMaterial" },
} as const;
const pickerButtonClass =
  "bg-foreground/10 focus:border-primary disabled:text-foreground w-full rounded-xl border px-4 py-2 text-start focus:outline-none";

export default function StreamForm({
  formType,
  streamType,
  stream,
  topics,
  classroom,
  enrolledClasses,
  user,
  onClose,
}: {
  formType: StreamFormType;
  streamType: StreamType;
  stream?: Stream;
  topics: ClassTopic[] | null;
  classroom: Classroom;
  enrolledClasses: EnrolledClass[] | null;
  user: SessionUser;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["stream", "common"]);

  const addLinkRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = useRef<HTMLDivElement>(null);
  const selectUsersRef = useRef<HTMLDivElement>(null);

  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newUrlLinks, setNewUrlLinks] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [safeInteraction, setSafeInteraction] = useState(false);
  const [showDueDateDropdown, setShowDueDateDropdown] = useState(false);
  const [showSelectUsersModal, setShowSelectUsersModal] = useState(false);
  const [dueDatePickerIsOpen, setDueDatePickerIsOpen] = useState(false);
  const [scheduledPickerIsOpen, setScheduledPickerIsOpen] = useState(false);
  const [grade, setGrade] = useState(String(stream?.points ?? "100"));
  const [topicId, setTopicId] = useState(stream?.topicId ?? "no-topic");
  const [isGraded, setIsGraded] = useState(stream?.points ? "true" : "false");
  const [hasDueDate, setHasDueDate] = useState(
    stream?.dueDate ? "true" : "false",
  );
  const [topicName, setTopicName] = useState(stream?.topicName ?? "no-topic");
  const [currentUrlLinks, setCurrentUrlLinks] = useState<string[]>(
    stream?.links ?? [],
  );
  const [closeSubmissions, setCloseSubmissions] = useState(
    stream?.closeSubmissionsAfterDueDate ?? false,
  );
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(
    stream?.attachments ?? [],
  );
  const [isAcceptingSubmissions, setIsAcceptingSubmissions] = useState(
    stream?.acceptingSubmissions ?? true,
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    stream?.dueDate ? new Date(stream.dueDate) : undefined,
  );
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    stream?.scheduledAt ? new Date(stream.scheduledAt) : undefined,
  );
  const [audience, setAudience] = useState<string[]>(
    stream && !stream.announceToAll && stream.announceTo?.length
      ? stream.announceTo
      : (enrolledClasses?.map((u) => u.userId) ?? []),
  );

  const isTeacher = user.id === classroom.teacherId;
  const allSelected = (enrolledClasses?.length ?? 0) === audience.length;
  const titleKey =
    titleKeys[streamType][formType === "edit" && stream ? "edit" : "create"];

  function armSafeInteraction(duration = 300) {
    setSafeInteraction(true);
    setTimeout(() => setSafeInteraction(false), duration);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    formData.set("type", streamType);
    formData.set("classroomId", classroom.id);
    if (stream) formData.set("streamId", stream.id);
    formData.set("topicId", topicId);
    formData.set("isAssignToAll", String(allSelected));
    formData.set("acceptingSubmissions", String(isAcceptingSubmissions));
    formData.set("closeSubmissionsAfterDueDate", String(closeSubmissions));
    if (!allSelected)
      for (const person of audience) formData.append("announceTo", person);
    if (
      isGraded === "true" &&
      streamType !== "stream" &&
      streamType !== "material"
    )
      formData.set("points", grade);
    if (hasDueDate === "true" && dueDate)
      formData.set("dueDate", dueDate.toISOString());
    if (scheduledDate) formData.set("scheduledAt", scheduledDate.toISOString());
    for (const link of newUrlLinks) formData.append("links", link);
    for (const file of newAttachments) formData.append("attachments", file);
    for (const link of currentUrlLinks) formData.append("curUrlLinks", link);
    for (const file of currentAttachments)
      formData.append("curAttachments", file);

    try {
      const { success, message } = await (formType === "create"
        ? createStreamFn({ data: formData })
        : updateStreamFn({ data: formData }));

      if (!success) {
        toast.error(message);
        return;
      }

      toast.success(message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: streamKeys.all }),
        queryClient.invalidateQueries({ queryKey: classworkKeys.all }),
        queryClient.invalidateQueries({
          queryKey: classTopicKeys.byClass(classroom.id),
        }),
      ]);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  function handlePickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const valid = files.filter((file) => file.size <= MAX_FILE_BYTES);
    if (valid.length !== files.length)
      toast.error(t("stream:form.messages.fileTooLarge"));
    if (valid.length) setNewAttachments((prev) => [...prev, ...valid]);
  }

  function handleAddUrl() {
    if (!isWebUrl(url)) {
      toast.error(t("stream:form.messages.invalidUrl"));
      return;
    }
    setNewUrlLinks([...newUrlLinks, url]);
    setUrl("");
    setShowAddLinkModal(false);
  }

  function handleGradeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (!/^\d*$/.test(value)) return;
    setGrade(
      value.length > 1 && value.startsWith("0")
        ? String(Number.parseInt(value, 10))
        : value,
    );
  }

  function handleGradeBlur() {
    if ((grade === "" || Number(grade) === 0) && isGraded === "true")
      setGrade("100");
  }

  useClickOutside(
    formWrapperRef,
    () => {
      if (!safeInteraction) onClose();
    },
    isLoading ||
      scheduledPickerIsOpen ||
      dueDatePickerIsOpen ||
      showGradeDropdown ||
      showDueDateDropdown ||
      showTopicDropdown ||
      safeInteraction ||
      showSelectUsersModal ||
      showAddLinkModal,
  );
  useClickOutside(
    selectUsersRef,
    () => setShowSelectUsersModal(false),
    isLoading,
  );
  useClickOutside(addLinkRef, () => setShowAddLinkModal(false), isLoading);

  const dropdownTrigger = (label: string) => (
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className={pickerButtonClass}
        disabled={isLoading}
        onClick={(e) => {
          e.stopPropagation();
          armSafeInteraction();
        }}
      >
        {label}
      </button>
    </DropdownMenuTrigger>
  );

  return (
    <div className="modal__container">
      <AnimatePresence>
        <motion.div
          className="bg-card fixed right-0 bottom-0 left-0 z-10 h-[95%] overflow-y-scroll rounded-t-2xl border-t"
          ref={formWrapperRef}
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
            onSubmit={handleSubmit}
          >
            <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
              <h3 className="text-foreground text-lg font-semibold tracking-tight">
                {t(`stream:form.titles.${titleKey}`)}
              </h3>
              <Button
                className="hover:bg-transparent"
                variant="ghost"
                type="button"
                size="icon"
                disabled={isLoading}
                onClick={onClose}
                aria-label={t("stream:form.close")}
              >
                <X className="stroke-foreground size-5" />
              </Button>
            </div>
            <div
              className={`grid px-4 pb-4 md:gap-4 md:px-8 md:pb-8 ${streamType !== "stream" ? "md:grid-cols-2" : ""}`}
            >
              <div className="flex flex-col justify-start gap-3">
                {isTeacher && (
                  <div className="flex flex-col items-start justify-start gap-2">
                    <Label>{t("stream:form.assignTo")}</Label>
                    <button
                      type="button"
                      onClick={() => setShowSelectUsersModal(true)}
                      disabled={isLoading}
                      className={pickerButtonClass}
                    >
                      {allSelected
                        ? t("stream:form.allUsers")
                        : t("stream:form.usersSelected", {
                            count: audience.length,
                          })}
                    </button>
                    {showSelectUsersModal && (
                      <div className="modal__container">
                        <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[30%]">
                          <Card className="md:w-[25rem]" ref={selectUsersRef}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <h3 className="text-foreground text-lg font-medium tracking-tight">
                                  {t("stream:form.assignTo")}
                                </h3>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-transparent"
                                  disabled={isLoading}
                                  onClick={() => setShowSelectUsersModal(false)}
                                  aria-label={t("stream:form.close")}
                                >
                                  <X className="stroke-foreground" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="grid gap-4">
                                <ul className="grid gap-2">
                                  <li>
                                    <label
                                      htmlFor="assign-all"
                                      className="flex items-center gap-2 text-sm font-medium"
                                    >
                                      <Checkbox
                                        id="assign-all"
                                        disabled={isLoading}
                                        checked={allSelected}
                                        onCheckedChange={(checked) =>
                                          setAudience(
                                            checked
                                              ? (enrolledClasses?.map(
                                                  (u) => u.userId,
                                                ) ?? [])
                                              : [],
                                          )
                                        }
                                      />
                                      {t("stream:form.allUsers")}
                                    </label>
                                  </li>
                                  {enrolledClasses?.map((enrolled) => (
                                    <li key={enrolled.id}>
                                      <label
                                        htmlFor={`assign-${enrolled.userId}`}
                                        className="flex items-center gap-2 text-sm font-medium"
                                      >
                                        <Checkbox
                                          id={`assign-${enrolled.userId}`}
                                          disabled={isLoading}
                                          checked={audience.includes(
                                            enrolled.userId,
                                          )}
                                          onCheckedChange={(checked) =>
                                            setAudience(
                                              checked
                                                ? [...audience, enrolled.userId]
                                                : audience.filter(
                                                    (id) =>
                                                      id !== enrolled.userId,
                                                  ),
                                            )
                                          }
                                        />
                                        <img
                                          src={enrolled.userImage}
                                          alt={t("stream:form.avatarAlt", {
                                            name: enrolled.userName,
                                          })}
                                          width={24}
                                          height={24}
                                          className="h-6 w-6 rounded-full"
                                        />
                                        {enrolled.userName}
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="mt-4 flex justify-end">
                                <Button
                                  type="button"
                                  onClick={() => setShowSelectUsersModal(false)}
                                >
                                  {t("stream:form.done")}
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
                      {t("stream:form.title")}{" "}
                      <span className="text-destructive"> *</span>
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      required
                      disabled={isLoading}
                      name="title"
                      defaultValue={stream?.title ?? ""}
                      placeholder={t("stream:form.titlePlaceholder")}
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="description">
                    {streamType === "stream" && t("stream:form.caption")}
                    {(streamType === "quiz" ||
                      streamType === "assignment" ||
                      streamType === "question") &&
                      t("stream:form.instructions")}
                    {streamType === "material" && t("stream:form.description")}
                    {streamType === "stream" && (
                      <span className="text-destructive"> *</span>
                    )}
                  </Label>
                  <Textarea
                    id="description"
                    required={streamType === "stream"}
                    name="description"
                    placeholder={t("stream:form.captionPlaceholder")}
                    className="bg-foreground/10 h-[10rem] w-full resize-none rounded-xl px-4 py-2"
                    disabled={isLoading}
                    defaultValue={stream?.content ?? ""}
                  />
                </div>
                {isTeacher && streamType === "stream" && (
                  <div className="grid gap-2">
                    <Label htmlFor="date">
                      {t("stream:form.schedulePost")}
                    </Label>
                    <DateTimePicker
                      disabled={isLoading}
                      showLabels={false}
                      date={scheduledDate}
                      onSetDate={setScheduledDate}
                      datePickerIsOpen={scheduledPickerIsOpen}
                      onSetDatePickerIsOpen={setScheduledPickerIsOpen}
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  {currentAttachments.length || newAttachments.length ? (
                    <span className="font-medium">
                      {t("stream:form.files")}
                    </span>
                  ) : null}
                  <ul className="grid gap-1 overflow-y-auto">
                    {newAttachments.map((file, index) => (
                      <AttachmentFileCard
                        file={file.name}
                        index={index}
                        type="newFile"
                        location="form"
                        isLoading={isLoading}
                        onRemoveAttachment={(i) =>
                          setNewAttachments((prev) =>
                            prev.filter((_, j) => j !== i),
                          )
                        }
                        key={`${file.name}-${file.size}-${file.lastModified}`}
                      />
                    ))}
                    {currentAttachments.map((file, index) => (
                      <AttachmentFileCard
                        file={file}
                        index={index}
                        type="curFile"
                        location="form"
                        isLoading={isLoading}
                        onRemoveAttachment={(i) =>
                          setCurrentAttachments((prev) =>
                            prev.filter((_, j) => j !== i),
                          )
                        }
                        key={file}
                      />
                    ))}
                  </ul>
                </div>
                <div className="mb-2 grid gap-2">
                  {currentUrlLinks.length || newUrlLinks.length ? (
                    <span className="font-medium">
                      {t("stream:form.links")}
                    </span>
                  ) : null}
                  <ul className="grid gap-1 overflow-y-auto">
                    {newUrlLinks.map((link, index) => (
                      <AttachmentLinkCard
                        link={link}
                        index={index}
                        location="form"
                        isLoading={isLoading}
                        onRemoveAttachment={(i) =>
                          setNewUrlLinks((prev) =>
                            prev.filter((_, j) => j !== i),
                          )
                        }
                        key={link}
                      />
                    ))}
                    {currentUrlLinks.map((link, index) => (
                      <AttachmentLinkCard
                        link={link}
                        index={index}
                        location="form"
                        isLoading={isLoading}
                        onRemoveAttachment={(i) =>
                          setCurrentUrlLinks((prev) =>
                            prev.filter((_, j) => j !== i),
                          )
                        }
                        key={link}
                      />
                    ))}
                  </ul>
                </div>
              </div>
              {streamType !== "stream" && (
                <div className="flex flex-col gap-3">
                  {streamType !== "material" && (
                    <>
                      <div className="grid gap-2">
                        <Label>{t("stream:form.points")}</Label>
                        <div
                          className={`grid gap-2 ${isGraded === "true" ? "grid-cols-2" : ""}`}
                        >
                          <DropdownMenu
                            onOpenChange={(open) => {
                              setShowGradeDropdown(open);
                              armSafeInteraction();
                            }}
                          >
                            {dropdownTrigger(
                              isGraded === "true"
                                ? t("stream:form.graded")
                                : t("stream:form.ungraded"),
                            )}
                            <DropdownMenuContent
                              className="z-[1100]"
                              align="start"
                            >
                              <DropdownMenuItem
                                textValue="graded"
                                onClick={() => {
                                  setIsGraded("true");
                                  armSafeInteraction();
                                }}
                              >
                                {t("stream:form.graded")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                textValue="ungraded"
                                onClick={() => {
                                  setIsGraded("false");
                                  armSafeInteraction();
                                }}
                              >
                                {t("stream:form.ungraded")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {isGraded === "true" && (
                            <Input
                              type="number"
                              value={grade}
                              onChange={handleGradeChange}
                              onBlur={handleGradeBlur}
                              disabled={isLoading}
                              aria-label={t("stream:form.points")}
                            />
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>{t("stream:form.dueDate")}</Label>
                        <div className="grid gap-2">
                          <DropdownMenu
                            onOpenChange={(open) => {
                              setShowDueDateDropdown(open);
                              armSafeInteraction();
                            }}
                          >
                            {dropdownTrigger(
                              hasDueDate === "true"
                                ? t("stream:form.dueDate")
                                : t("stream:form.noDueDate"),
                            )}
                            <DropdownMenuContent
                              className="z-[1100]"
                              align="start"
                            >
                              <DropdownMenuItem
                                textValue="dueDate"
                                onClick={() => {
                                  setHasDueDate("true");
                                  armSafeInteraction();
                                }}
                              >
                                {t("stream:form.dueDate")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                textValue="noDueDate"
                                onClick={() => {
                                  setHasDueDate("false");
                                  armSafeInteraction();
                                }}
                              >
                                {t("stream:form.noDueDate")}
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
                    <Label>{t("stream:form.topic")}</Label>
                    <DropdownMenu
                      onOpenChange={(open) => {
                        setShowTopicDropdown(open);
                        armSafeInteraction();
                      }}
                    >
                      {dropdownTrigger(
                        topicName === "no-topic"
                          ? t("stream:form.noTopic")
                          : topicName,
                      )}
                      <DropdownMenuContent className="z-[1100]" align="start">
                        <DropdownMenuItem
                          textValue="no-topic"
                          onClick={() => {
                            setTopicId("no-topic");
                            setTopicName("no-topic");
                            armSafeInteraction();
                          }}
                        >
                          {t("stream:form.noTopic")}
                        </DropdownMenuItem>
                        {topics?.map((topic) => (
                          <DropdownMenuItem
                            key={topic.id}
                            textValue={topic.name}
                            onClick={() => {
                              setTopicId(topic.id);
                              setTopicName(topic.name);
                              armSafeInteraction();
                            }}
                          >
                            {topic.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">
                      {t("stream:form.schedule", { type: streamType })}
                    </Label>
                    <DateTimePicker
                      disabled={isLoading}
                      showLabels={false}
                      date={scheduledDate}
                      onSetDate={setScheduledDate}
                      datePickerIsOpen={scheduledPickerIsOpen}
                      onSetDatePickerIsOpen={setScheduledPickerIsOpen}
                    />
                  </div>
                  {streamType !== "material" && (
                    <>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <Checkbox
                            disabled={isLoading}
                            checked={isAcceptingSubmissions}
                            onCheckedChange={(check) =>
                              setIsAcceptingSubmissions(check === true)
                            }
                          />
                          <span>{t("stream:form.acceptingSubmissions")}</span>
                        </Label>
                      </div>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <Checkbox
                            disabled={isLoading}
                            checked={closeSubmissions}
                            onCheckedChange={(check) =>
                              setCloseSubmissions(check === true)
                            }
                          />
                          <span>{t("stream:form.closeAfterDue")}</span>
                        </Label>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="bg-card fixed right-0 bottom-0 left-0 flex w-auto items-center justify-end gap-2 border-t px-4 py-4 md:px-8">
              <div className="mr-2 flex items-start gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={isLoading}
                  asChild
                >
                  <label>
                    <span className="sr-only">{t("stream:form.upload")}</span>
                    <input
                      type="file"
                      multiple
                      className="input__file hidden"
                      disabled={isLoading}
                      onChange={handlePickFiles}
                    />
                    <Upload className="stroke-foreground size-4 md:size-5" />
                  </label>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddLinkModal(true)}
                  disabled={isLoading}
                  aria-label={t("stream:form.addLink")}
                >
                  <LinkIcon className="stroke-foreground size-4 md:size-5" />
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
                      <Card className="md:w-[25rem]" ref={addLinkRef}>
                        <CardHeader className="text-lg font-medium tracking-tight">
                          {t("stream:form.addLink")}
                        </CardHeader>
                        <CardContent className="grid gap-4">
                          <Input
                            type="text"
                            placeholder={t("stream:form.urlPlaceholder")}
                            required
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                            onKeyDown={(event) =>
                              event.key === "Enter" && handleAddUrl()
                            }
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => setShowAddLinkModal(false)}
                            >
                              {t("common:actions.cancel")}
                            </Button>
                            <Button type="button" onClick={handleAddUrl}>
                              {t("stream:form.add")}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}
              </div>
              {!isLoading && (
                <Button type="button" variant="secondary" onClick={onClose}>
                  {t("common:actions.cancel")}
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {formType === "edit"
                  ? t("stream:form.saveChanges")
                  : t("stream:form.create")}
              </Button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
