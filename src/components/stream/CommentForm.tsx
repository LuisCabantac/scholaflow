import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, SendHorizontal } from "lucide-react";

import ZoomedImage from "@/components/stream/ZoomedImage";
import { TextareaAutosize } from "@/components/ui/textarea-autosize";

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

export default function CommentForm({
  fields,
  isPending,
  placeholder,
  pendingPlaceholder,
  onSubmit,
}: {
  fields: Record<string, string>;
  isPending: boolean;
  placeholder: string;
  pendingPlaceholder: string;
  onSubmit: (formData: FormData) => void;
}) {
  const { t } = useTranslation("stream", { keyPrefix: "card" });
  const [comment, setComment] = useState("");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [attachmentImage, setAttachmentImage] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (attachmentImage) formData.append("attachment", attachmentImage);
    onSubmit(formData);
    setComment("");
    setAttachmentImage(null);
    setAttachmentPreview(null);
  }

  function handlePickImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error(t("messages.attachmentTooLarge"));
      return;
    }
    setAttachmentImage(file);
    setAttachmentPreview(URL.createObjectURL(file));
  }

  return (
    <>
      <form
        className={`flex w-full ${comment.length > 50 ? "items-end" : "items-center"}`}
        onSubmit={handleSubmit}
      >
        {Object.entries(fields).map(([name, value]) => (
          <input
            key={name}
            type="text"
            name={name}
            value={value}
            readOnly
            hidden
          />
        ))}
        <TextareaAutosize
          required={!attachmentImage}
          disabled={isPending}
          name="comment"
          className="resize-none"
          minRows={1}
          maxRows={6}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={isPending ? pendingPlaceholder : placeholder}
        />
        {!attachmentImage && !isPending && (
          <label className="px-4 py-2">
            <span className="sr-only">{t("attachImage")}</span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              disabled={isPending}
              onChange={handlePickImage}
            />
            <ImagePlus className="stroke-foreground/90 size-5" />
          </label>
        )}
        <button
          type="submit"
          className={`py-2 ${attachmentImage || isPending ? "pl-2" : ""}`}
          disabled={isPending}
          aria-label={t("send")}
        >
          {isPending ? (
            <div className="spinner__mini dark" />
          ) : (
            <SendHorizontal className="stroke-primary size-6" />
          )}
        </button>
      </form>
      {attachmentPreview ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setZoomedImage(attachmentPreview)}
          >
            <img
              src={attachmentPreview}
              alt={t("commentAttachmentAlt")}
              width={150}
              height={150}
              className="mt-2 rounded-xl"
              onDragStart={(e) => e.preventDefault()}
            />
          </button>
          <button
            type="button"
            className="absolute top-1 left-1 rounded-full bg-black/70 p-1"
            aria-label={t("removeImage")}
            onClick={() => {
              setAttachmentImage(null);
              setAttachmentPreview(null);
            }}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5 stroke-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : null}
      {zoomedImage && (
        <ZoomedImage src={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </>
  );
}
