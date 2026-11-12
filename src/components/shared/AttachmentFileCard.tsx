import { toast } from "sonner";
import FileSaver from "file-saver";
import { useTranslation } from "react-i18next";

import type { AttachmentFileKind, AttachmentLocation } from "@/types/stream";
import {
  getFileNameFromAttachments,
  removeUUIDFromFilename,
} from "@/lib/utils";

export default function AttachmentFileCard({
  file,
  index,
  type,
  location,
  isLoading,
  onRemoveAttachment,
}: {
  file: string;
  index: number;
  type: AttachmentFileKind;
  location: AttachmentLocation;
  isLoading?: boolean;
  onRemoveAttachment?: (index: number) => void;
}) {
  const { t } = useTranslation("common", { keyPrefix: "attachments" });

  const canRemove = !isLoading && location === "form" && !!onRemoveAttachment;

  async function handleDownload(fileUrl: string) {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(response.statusText);
      const blob = await response.blob();
      FileSaver.saveAs(blob, fileUrl.split("/").pop() || "download");
    } catch {
      toast.error(t("downloadFailed"));
    }
  }

  return (
    <li className="bg-foreground/5 relative flex w-full items-center overflow-hidden rounded-xl border shadow-sm">
      <div
        className={`flex items-center justify-between p-3 ${canRemove ? "w-[88%]" : "w-[90%]"}`}
      >
        <div className="flex w-full items-center gap-2">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            className="stroke-foreground size-4 shrink-0 md:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
            />
          </svg>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap">
            {type === "curFile"
              ? getFileNameFromAttachments(removeUUIDFromFilename(file))
              : file}
          </p>
        </div>
      </div>
      <div className="absolute -right-1 bottom-[0.85rem] flex items-center gap-4">
        {type === "curFile" && (
          <button
            type="button"
            onClick={() => handleDownload(file)}
            className="m-0 border-none bg-transparent p-0"
            aria-label={t("download")}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="stroke-primary hover:stroke-primary/90 size-4 shrink-0 md:size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </button>
        )}
        {canRemove ? (
          <button
            onClick={() => onRemoveAttachment?.(index)}
            className="pr-4"
            type="button"
            aria-label={t("remove")}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="stroke-destructive hover:stroke-destructive/90 size-4 shrink-0 md:size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        ) : (
          <div className="w-2" />
        )}
      </div>
    </li>
  );
}
