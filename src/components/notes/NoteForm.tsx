import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { ClientOnly } from "@tanstack/react-router";
import type { SerializedEditorState } from "lexical";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Pin, PinOff, Trash2, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { formatDate } from "@/lib/utils";
import { useNow } from "@/hooks/use-now";
import type { Note } from "@/lib/schema";
import { notesKeys } from "@/queries/notes";
import { useDismiss } from "@/hooks/use-dismiss";
import type { NoteFormType } from "@/types/notes";
import { useClickOutside } from "@/hooks/use-click-outside";
import { createNoteFn, updateNoteFn } from "@/server/functions/notes";

import { Button } from "@/components/ui/button";
import Editor from "@/components/editor/Editor";
import ZoomedImage from "@/components/stream/ZoomedImage";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

const MAX_FILE_BYTES = 4 * 1024 * 1024;

const initialValue = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
} as unknown as SerializedEditorState;

function parseContent(content: string | null | undefined) {
  if (!content) return initialValue;
  try {
    return JSON.parse(content) as SerializedEditorState;
  } catch {
    return initialValue;
  }
}

export default function NoteForm({
  note,
  type,
  onDeleteNote,
  deleteNoteIsPending,
  onClose,
}: {
  note?: Note;
  type: NoteFormType;
  onDeleteNote: (noteId: string) => void;
  deleteNoteIsPending: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const now = useNow();
  const { t } = useTranslation("notes");

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(note?.title ?? "");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPinned, setIsPinned] = useState(note?.isPinned ?? false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [safeInteraction, setSafeInteraction] = useState(false);
  const [editorDropdownIsOpen, setEditorDropdownIsOpen] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(
    note?.attachments ?? [],
  );
  const [newAttachments, setNewAttachments] = useState<
    { file: File; url: string }[]
  >([]);
  const [editorState, setEditorState] = useState<SerializedEditorState>(() =>
    parseContent(note?.content),
  );

  function armSafeInteraction(duration = 300) {
    setSafeInteraction(true);
    setTimeout(() => setSafeInteraction(false), duration);
  }

  const attachmentsRef = useRef(newAttachments);
  attachmentsRef.current = newAttachments;

  useEffect(
    () => () => {
      for (const item of attachmentsRef.current) URL.revokeObjectURL(item.url);
    },
    [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      formData.set("isPinned", String(isPinned));
      formData.set("description", JSON.stringify(editorState));
      for (const attachment of newAttachments) {
        formData.append("attachments", attachment.file);
      }
      if (type === "edit") {
        formData.set("noteId", note?.id ?? "");
        for (const url of currentAttachments) {
          formData.append("curAttachments", url);
        }
      }

      const { success, message } = await (type === "create"
        ? createNoteFn({ data: formData })
        : updateNoteFn({ data: formData }));

      if (success) {
        toast.success(message);
        onClose();
        queryClient.invalidateQueries({ queryKey: notesKeys.all });
      } else toast.error(message);
    } catch {
      toast.error(t("form.saveFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddAttachments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    let total = newAttachments.reduce((sum, item) => sum + item.file.size, 0);
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_BYTES || total + file.size > MAX_FILE_BYTES)
        return false;
      total += file.size;
      return true;
    });

    if (validFiles.length !== files.length) {
      toast.error(t("form.attachmentTooLarge"));
    }

    setNewAttachments((prev) => [
      ...prev,
      ...validFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
    event.target.value = "";
  }

  function handleRemoveNewAttachment(index: number) {
    setNewAttachments((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleRemoveCurrentAttachment(index: number) {
    setCurrentAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function openZoomedImage(url: string) {
    setZoomedImage(url);
    armSafeInteraction();
  }

  const { phase, close } = useDismiss(
    onClose,
    isLoading ||
      showConfirmation ||
      editorDropdownIsOpen ||
      safeInteraction ||
      !!zoomedImage,
  );
  useClickOutside(
    wrapperRef,
    () => {
      if (!safeInteraction) close();
    },
    isLoading ||
      showConfirmation ||
      editorDropdownIsOpen ||
      safeInteraction ||
      !!zoomedImage,
  );

  const previews = [
    ...newAttachments.map((attachment, index) => ({
      url: attachment.url,
      remove: () => handleRemoveNewAttachment(index),
    })),
    ...currentAttachments.map((url, index) => ({
      url,
      remove: () => handleRemoveCurrentAttachment(index),
    })),
  ];

  return (
    <div className="modal__container" data-phase={phase}>
      <div
        className="modal__drawer bg-card fixed right-0 bottom-0 left-0 z-10 h-[95%] overflow-y-scroll rounded-t-md"
        ref={wrapperRef}
      >
        <form
          className="relative min-h-screen w-full rounded-t-md border-t pb-[6rem] shadow-sm"
          onSubmit={handleSubmit}
        >
          <button
            className="absolute top-4 right-4 md:top-8 md:right-8"
            type="button"
            disabled={isLoading}
            onClick={close}
            aria-label={t("form.close")}
          >
            <X
              strokeWidth={2}
              className="size-5 transition-all hover:stroke-foreground/70"
            />
          </button>
          <div className="grid h-full gap-2 px-4 py-4 pb-4 md:px-24 md:py-16 md:pb-8">
            <div className="mt-6 columns-2 gap-2 md:mt-0 md:columns-4">
              {previews.map((preview) => (
                <div key={preview.url} className="relative">
                  {!isLoading && (
                    <button
                      type="button"
                      disabled={isLoading}
                      className="absolute top-1 left-1 rounded-full bg-black/70 p-1"
                      onClick={preview.remove}
                      aria-label={t("form.removeImage")}
                    >
                      <X strokeWidth={2} className="size-5 stroke-white" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="mb-2 block w-full break-inside-avoid"
                    onClick={() => openZoomedImage(preview.url)}
                  >
                    <img
                      src={preview.url}
                      alt={preview.url}
                      width={500}
                      height={500}
                      className="w-auto rounded-md object-cover select-none"
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div>
              {note && (
                <ClientOnly fallback={<p className="h-4 text-xs" />}>
                  <p className="text-foreground text-xs">
                    {note.updatedAt
                      ? t("card.updated", {
                          date: formatDate(note.updatedAt, now),
                        })
                      : t("card.created", {
                          date: formatDate(note.createdAt, now),
                        })}
                  </p>
                </ClientOnly>
              )}
              <input
                type="text"
                name="title"
                className="w-[90%] border-none bg-transparent text-3xl font-semibold focus:outline-none"
                placeholder={t("form.titlePlaceholder")}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div>
              <Editor
                editorSerializedState={editorState}
                onSerializedChange={setEditorState}
                onDropdownStateChange={setEditorDropdownIsOpen}
                onSafeInteraction={armSafeInteraction}
              />
            </div>
          </div>
          <div className="fixed right-0 bottom-0 left-0 flex w-auto items-center justify-between gap-4 border-t px-4 py-4 md:px-8">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="p-0 hover:bg-transparent"
                asChild
              >
                <label aria-label={t("form.addImages")}>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    disabled={isLoading}
                    onChange={handleAddAttachments}
                  />
                  <ImagePlus className="size-5 md:size-6" />
                </label>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="p-0 hover:bg-transparent"
                onClick={() => setIsPinned((prev) => !prev)}
                aria-label={isPinned ? t("form.unpin") : t("form.pin")}
                aria-pressed={isPinned}
              >
                {isPinned ? (
                  <Pin className="size-5 md:size-6" />
                ) : (
                  <PinOff className="size-5 md:size-6" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {type === "edit" && (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isLoading || deleteNoteIsPending}
                  onClick={() => setShowConfirmation(true)}
                >
                  <Trash2 className="size-5 md:size-6" />
                  {t("form.delete")}
                </Button>
              )}
              <Button
                disabled={isLoading}
                type="submit"
                variant={type === "edit" ? "secondary" : "default"}
              >
                {type === "edit" ? t("form.saveChanges") : t("form.create")}
              </Button>
            </div>
          </div>
        </form>
        {zoomedImage && (
          <ZoomedImage src={zoomedImage} onClose={() => setZoomedImage(null)} />
        )}
        {showConfirmation && (
          <ConfirmationModal
            type="delete"
            btnLabel={t("form.delete")}
            isLoading={deleteNoteIsPending}
            handleCancel={() => setShowConfirmation(false)}
            handleAction={() => onDeleteNote(note?.id ?? "")}
          >
            {t("form.confirmDelete")}
          </ConfirmationModal>
        )}
      </div>
    </div>
  );
}
