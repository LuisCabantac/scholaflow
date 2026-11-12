import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ImagePlus, SendHorizontal } from "lucide-react";

import type { PendingAttachment } from "@/types/chat";
import { MAX_CHAT_ATTACHMENT_BYTES, splitBySize } from "@/lib/chat-messages";

import { TextareaAutosize } from "@/components/ui/textarea-autosize";
import AttachmentFileCard from "@/components/shared/AttachmentFileCard";

export default function ChatComposer({
  classroomId,
  isPending,
  onSend,
  onLengthChange,
}: {
  classroomId: string;
  isPending: boolean;
  onSend: (formData: FormData) => void;
  onLengthChange: (length: number) => void;
}) {
  const { t } = useTranslation("chat");

  const nextId = useRef(0);
  const [message, setMessage] = useState("");
  const [expandAttachments, setExpandAttachments] = useState(false);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    for (const { file } of attachments) formData.append("attachments", file);
    onSend(formData);
    setMessage("");
    onLengthChange(0);
    setAttachments([]);
  }

  function handlePickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const { accepted, rejected } = splitBySize(
      files,
      MAX_CHAT_ATTACHMENT_BYTES,
    );
    for (const file of rejected) {
      toast.error(t("messages.fileTooLarge", { name: file.name }));
    }
    setAttachments((previous) => [
      ...previous,
      ...accepted.map((file) => ({ id: nextId.current++, file })),
    ]);
    event.target.value = "";
  }

  function handleRemoveAttachment(index: number) {
    setAttachments((previous) => previous.filter((_, i) => i !== index));
  }

  function toggleExpandAttachments() {
    setExpandAttachments(!expandAttachments);
  }

  return (
    <div className="bg-background fixed right-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 z-10 pt-2 md:absolute md:right-0 md:bottom-0 md:left-0 md:w-full md:bg-card md:pt-0">
      {attachments.length ? (
        <>
          <div className="flex justify-between border-t pt-2">
            <p className="font-medium">{t("attachments")}</p>
            <button
              type="button"
              onClick={toggleExpandAttachments}
              aria-label={t("toggleAttachments")}
            >
              <ChevronDown
                strokeWidth={3}
                className={`${expandAttachments ? "rotate-180" : "rotate-0"} w-6 transition-transform`}
              />
            </button>
          </div>
          {!expandAttachments && (
            <button
              type="button"
              className="flex w-full items-center gap-1 rounded-xl border p-3 shadow-sm md:p-4"
              onClick={toggleExpandAttachments}
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
              <span>{t("seeAttachments", { count: attachments.length })}</span>
            </button>
          )}
          <ul className="mb-2 grid gap-1 overflow-y-auto md:max-h-40">
            {expandAttachments &&
              attachments.map(({ id, file }, index) => (
                <AttachmentFileCard
                  key={id}
                  file={file.name}
                  index={index}
                  type="newFile"
                  location="form"
                  isLoading={isPending}
                  onRemoveAttachment={handleRemoveAttachment}
                />
              ))}
          </ul>
        </>
      ) : null}
      <div className="flex items-center gap-2">
        <form className="flex w-full items-end gap-2" onSubmit={handleSubmit}>
          <label className="py-[0.65rem]">
            <span className="sr-only">{t("attachImages")}</span>
            <input
              type="file"
              multiple
              className="input__file hidden"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              disabled={isPending}
              onChange={handlePickFiles}
            />
            <ImagePlus className="size-5 md:size-6" />
          </label>
          <div
            className={`comment__form flex w-full gap-2 ${message.length > 50 ? "items-end" : "items-center"}`}
          >
            <input
              type="text"
              name="classroomId"
              value={classroomId}
              readOnly
              hidden
            />
            <TextareaAutosize
              name="message"
              value={message}
              className="resize-none"
              minRows={1}
              maxRows={6}
              required={!attachments.length}
              placeholder={
                isPending ? t("pendingPlaceholder") : t("placeholder")
              }
              disabled={isPending}
              onChange={(event) => {
                setMessage(event.target.value);
                onLengthChange(event.target.value.length);
              }}
            />
            <button
              type="submit"
              className="group py-2"
              disabled={isPending}
              aria-label={t("send")}
            >
              {isPending ? (
                <div className="spinner__mini dark" />
              ) : (
                <SendHorizontal className="stroke-primary size-6 group-disabled:opacity-50" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
