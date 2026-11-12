import { toast } from "sonner";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Plus } from "lucide-react";
import { ClientOnly } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { isWebUrl } from "@/lib/links";
import { useNow } from "@/hooks/use-now";
import { streamKeys } from "@/queries/stream";
import type { SessionUser } from "@/types/auth";
import { classworkKeys } from "@/queries/classwork";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { Classroom, Classwork, Stream } from "@/lib/schema";
import {
  submissionsOpen,
  submitLabel,
  workStatus,
} from "@/lib/classwork-rules";
import {
  submitClassworkFn,
  unsubmitClassworkFn,
  updateClassworkFn,
} from "@/server/functions/classwork";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SpinnerMini from "@/components/shared/SpinnerMini";
import PrivateComments from "@/components/stream/PrivateComments";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AttachmentFileCard from "@/components/shared/AttachmentFileCard";
import AttachmentLinkCard from "@/components/shared/AttachmentLinkCard";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

export default function StreamUserWork({
  stream,
  classroom,
  user,
  classwork,
}: {
  stream: Stream;
  classroom: Classroom;
  user: SessionUser;
  classwork: Classwork | null;
}) {
  const { t } = useTranslation("stream", { keyPrefix: "work" });
  const now = useNow();
  const { t: tCommon } = useTranslation("common");
  const queryClient = useQueryClient();

  const addWorkRef = useRef<HTMLDivElement>(null);
  const addLinkRef = useRef<HTMLDivElement>(null);

  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandPanel, setExpandPanel] = useState(false);
  const [showAddWork, setShowAddWork] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newUrlLinks, setNewUrlLinks] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [currentUrlLinks, setCurrentUrlLinks] = useState<string[]>(
    classwork?.links ?? [],
  );
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(
    classwork?.attachments ?? [],
  );
  const [showEditSubmission, setShowEditSubmission] = useState(
    classwork?.isTurnedIn ?? false,
  );

  const status = workStatus(classwork, stream, now);
  const open = submissionsOpen(stream, now);
  const attachmentCount =
    currentAttachments.length +
    currentUrlLinks.length +
    newUrlLinks.length +
    newAttachments.length;
  const hasWork = attachmentCount > 0;
  const label = submitLabel(hasWork, classwork, stream);
  const removalLocked = showEditSubmission ? showEditSubmission : isLoading;

  const storedLinks = classwork?.links;
  const storedAttachments = classwork?.attachments;

  useEffect(() => {
    if (storedLinks) setCurrentUrlLinks(storedLinks);
    if (storedAttachments) setCurrentAttachments(storedAttachments);
  }, [storedLinks, storedAttachments]);

  useClickOutside(addWorkRef, () => setShowAddWork(false), isLoading);
  useClickOutside(addLinkRef, () => setShowAddLink(false), isLoading);

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: classworkKeys.all }),
      queryClient.invalidateQueries({ queryKey: streamKeys.all }),
    ]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    for (const link of newUrlLinks) formData.append("links", link);
    for (const file of newAttachments) formData.append("attachments", file);
    for (const link of currentUrlLinks) formData.append("curUrlLinks", link);
    for (const file of currentAttachments)
      formData.append("curAttachments", file);

    try {
      const { success, message } = await (classwork
        ? updateClassworkFn({ data: formData })
        : submitClassworkFn({ data: formData }));
      if (!success) {
        toast.error(message);
        return;
      }
      toast.success(message);
      setShowEditSubmission(true);
      setNewUrlLinks([]);
      setNewAttachments([]);
      await invalidate();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnsubmit() {
    setIsLoading(true);
    try {
      const { success, message } = await unsubmitClassworkFn({
        data: {
          classworkId: classwork?.id ?? "",
          classroomId: stream.classId,
          streamId: stream.id,
        },
      });
      if (!success) {
        toast.error(message);
        return;
      }
      toast.success(message);
      setShowEditSubmission(false);
      await invalidate();
    } finally {
      setIsLoading(false);
    }
  }

  function handlePickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const valid = files.filter((file) => file.size <= MAX_FILE_BYTES);
    if (valid.length !== files.length) toast.error(t("messages.fileTooLarge"));
    setNewAttachments((current) => [...current, ...valid]);
    setShowAddWork(false);
  }

  function handleAddUrl() {
    if (!isWebUrl(url)) {
      toast.error(t("messages.invalidUrl"));
      return;
    }
    setNewUrlLinks((current) => [...current, url]);
    setUrl("");
    setShowAddLink(false);
  }

  const statusText =
    status === "graded"
      ? t("graded", { points: classwork?.points, total: stream.points })
      : status === "turnedIn"
        ? t("turnedIn")
        : status === "doneLate"
          ? t("doneLate")
          : status === "missing"
            ? t("missing")
            : null;

  return (
    <article className="bg-card fixed right-3 bottom-3 left-3 rounded-xl border p-3 shadow-lg md:static md:right-4 md:bottom-4 md:left-4 md:w-[30rem] md:p-4 md:shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-foreground mb-2 text-lg font-medium">
          {t("title")}
        </h4>
        <div className="flex items-center gap-1">
          <ClientOnly fallback={null}>
            {statusText && (
              <p
                className={`font-medium ${status === "missing" ? "text-destructive" : status === "graded" ? "text-foreground" : "text-foreground/90"}`}
              >
                {statusText}
              </p>
            )}
          </ClientOnly>
          <button
            type="button"
            className="block md:hidden"
            aria-label={expandPanel ? t("collapse") : t("expand")}
            onClick={() => setExpandPanel((current) => !current)}
          >
            <ChevronDown
              strokeWidth={3}
              className={`${expandPanel ? "rotate-180" : "rotate-0"} w-4 transition-transform`}
            />
          </button>
        </div>
      </div>
      {hasWork && !expandPanel ? (
        <button
          type="button"
          className="bg-card flex w-full items-center gap-1 rounded-md border p-3 text-sm shadow-sm md:hidden md:p-4 md:text-base"
          onClick={() => setExpandPanel(true)}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            className="stroke-foreground size-4 md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
            />
          </svg>
          <span>{t("seeAttachments", { count: attachmentCount })}</span>
        </button>
      ) : null}
      {!hasWork ? (
        <p className="text-foreground mb-2 text-sm">{t("noAttachments")}</p>
      ) : null}
      <div className={`${expandPanel ? "grid" : "hidden"} gap-2 md:grid`}>
        {currentAttachments.length || newAttachments.length ? (
          <div className="grid gap-2">
            <span className="text-foreground/90 text-sm font-medium">
              {t("files")}
            </span>
            <ul className="grid max-h-40 gap-1 overflow-y-auto md:max-h-40">
              {newAttachments.map((file, index) => (
                <AttachmentFileCard
                  file={file.name}
                  index={index}
                  type="newFile"
                  location="form"
                  isLoading={removalLocked}
                  onRemoveAttachment={(i) =>
                    setNewAttachments((current) =>
                      current.filter((_, j) => j !== i),
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
                  isLoading={removalLocked}
                  onRemoveAttachment={(i) =>
                    setCurrentAttachments((current) =>
                      current.filter((_, j) => j !== i),
                    )
                  }
                  key={file}
                />
              ))}
            </ul>
          </div>
        ) : null}
        {currentUrlLinks.length || newUrlLinks.length ? (
          <div className="grid gap-2">
            <span className="text-foreground/90 text-sm font-medium">
              {t("links")}
            </span>
            <ul className="grid max-h-40 gap-1 overflow-y-auto md:max-h-40">
              {newUrlLinks.map((link, index) => (
                <AttachmentLinkCard
                  link={link}
                  index={index}
                  location="form"
                  isLoading={removalLocked}
                  onRemoveAttachment={(i) =>
                    setNewUrlLinks((current) =>
                      current.filter((_, j) => j !== i),
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
                  isLoading={removalLocked}
                  onRemoveAttachment={(i) =>
                    setCurrentUrlLinks((current) =>
                      current.filter((_, j) => j !== i),
                    )
                  }
                  key={link}
                />
              ))}
            </ul>
          </div>
        ) : null}
        <PrivateComments
          layout="mobile"
          stream={stream}
          classroom={classroom}
          user={user}
          otherUserId={classroom.teacherId}
          classworkId={classwork?.id}
        />
      </div>
      <div className="item-center relative mt-2 grid gap-2" ref={addWorkRef}>
        {!showEditSubmission && (
          <>
            {!isLoading && (
              <Button
                type="button"
                variant={hasWork ? "secondary" : "default"}
                disabled={isLoading || !open}
                onClick={() => setShowAddWork((current) => !current)}
              >
                <Plus className="size-5" />
                {t("addWork")}
              </Button>
            )}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="classworkId"
                value={classwork?.id ?? ""}
                readOnly
                hidden
              />
              <input
                type="text"
                name="classroomId"
                value={stream.classId}
                readOnly
                hidden
              />
              <input
                type="text"
                name="streamId"
                value={stream.id}
                readOnly
                hidden
              />
              <Button
                type="submit"
                className="mt-2 w-full"
                variant={hasWork ? "default" : "secondary"}
                disabled={isLoading || !open}
              >
                <span className="flex items-center gap-2">
                  {isLoading &&
                    (hasWork ? (
                      <SpinnerMini />
                    ) : (
                      <div className="spinner__mini dark" />
                    ))}
                  <p>{t(label)}</p>
                </span>
              </Button>
            </form>
          </>
        )}
        {showEditSubmission && (
          <Button
            variant="secondary"
            type="button"
            onClick={handleUnsubmit}
            disabled={isLoading || !open}
          >
            {isLoading ? <SpinnerMini /> : t("unsubmit")}
          </Button>
        )}
        <PrivateComments
          layout="desktop"
          stream={stream}
          classroom={classroom}
          user={user}
          otherUserId={classroom.teacherId}
          classworkId={classwork?.id}
        />
        <div
          className={`${showAddWork ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} bg-card absolute -top-24 right-0 z-20 grid w-full gap-2 rounded-xl border p-2 text-sm shadow-md transition-all ease-in-out md:top-12`}
        >
          <label className="hover:bg-card/89 flex items-center gap-2 rounded-md p-2">
            <input
              type="file"
              multiple
              className="input__file hidden"
              disabled={isLoading}
              onChange={handlePickFiles}
            />
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              className="stroke-foreground size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            <span>{t("uploadFiles")}</span>
          </label>
          <button
            type="button"
            className="hover:bg-card/89 flex items-center gap-2 rounded-md p-2"
            onClick={() => {
              setShowAddWork(false);
              setShowAddLink(true);
            }}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="stroke-foreground size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
              />
            </svg>
            <span>{t("addLinks")}</span>
          </button>
        </div>
      </div>
      {showAddLink && (
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
                {t("addLink")}
              </CardHeader>
              <CardContent className="grid gap-4">
                <Input
                  type="text"
                  placeholder={t("urlPlaceholder")}
                  required
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && handleAddUrl()}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddLink(false)}
                  >
                    {tCommon("actions.cancel")}
                  </Button>
                  <Button type="button" onClick={handleAddUrl}>
                    {t("add")}
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
