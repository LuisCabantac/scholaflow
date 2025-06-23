"use client";

import Image from "next/image";
import { toast } from "sonner";
import { SerializedEditorState } from "lexical";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus, Pin, PinOff, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { formatDate } from "@/lib/utils";
import { Note, Session } from "@/lib/schema";
import { createNote, updateNote } from "@/lib/notes-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Editor } from "@/components/blocks/editor-00/editor";

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

export default function NoteForm({
  note,
  type,
  session,
  onDeleteNote,
  onSetShowNotesForm,
  deleteNoteIsPending,
  onToggleShowNotesForm,
}: {
  note?: Note;
  type: "create" | "edit";
  session: Session;
  onDeleteNote: (noteId: string) => void;
  onSetShowNotesForm: Dispatch<SetStateAction<boolean>>;
  deleteNoteIsPending: boolean;
  onToggleShowNotesForm: () => void;
}) {
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const notesFormModalWrapperRef = useRef(null);
  const zoomedImageWrapperRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPinned, setIsPinned] = useState(note?.isPinned ?? false);
  const [title, setTitle] = useState(note?.title ?? "");
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(
    note?.attachments ?? [],
  );
  const [attachmentImagesNames, setAttachmentImagesNames] = useState<string[]>(
    [],
  );
  const [attachmentImages, setAttachmentImages] = useState<File[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<SerializedEditorState>(
    note?.content ? JSON.parse(note.content) : initialValue,
  );
  const [safeInteractionPeriod, setSafeInteractionPeriod] = useState(false);
  const [editorDropdownIsOpen, setEditorDropdownIsOpen] = useState(false);

  function setSafeInteraction(duration = 300) {
    setSafeInteractionPeriod(true);
    setTimeout(() => setSafeInteractionPeriod(false), duration);
  }

  async function handleSubmitNote(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    formData.append("description", JSON.stringify(editorState));
    attachmentImages.forEach((attachment) =>
      formData.append("attachments", attachment),
    );
    const { success, message } = await (type === "create"
      ? createNote(isPinned, formData)
      : updateNote(isPinned, currentAttachments, formData));
    setIsLoading(false);
    if (success) {
      toast.success(message);
      onToggleShowNotesForm();
      queryClient.invalidateQueries({
        queryKey: [`notes--${session.id}`],
      });
    } else toast.error(message);
  }

  function handleSetAttachmentImages(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const maxSize = 5 * 1024 * 1024;
      const validFiles = files.filter((file) => file.size <= maxSize);
      const invalidFiles = files.filter((file) => file.size > maxSize);

      if (invalidFiles.length > 0) {
        toast.error("Each attachment must be 5MB or less.");
      }

      setAttachmentImages((prevFiles) => [...prevFiles, ...validFiles]);
    }
  }

  function handleAttachmentImageNameChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = event.target.files;
    if (files) {
      const maxSize = 5 * 1024 * 1024;
      const validFiles = Array.from(files).filter(
        (file) => file.size <= maxSize,
      );
      const newFileNames = validFiles.map((file) => URL.createObjectURL(file));
      setAttachmentImagesNames(newFileNames);
    }
  }

  function handleRemoveAttachmentImage(index: number) {
    setAttachmentImages((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
    setAttachmentImagesNames((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
  }

  function handleRemoveCurrentAttachmentImage(index: number) {
    setCurrentAttachments((prevFiles) =>
      prevFiles.filter((_, i: number) => i !== index),
    );
  }

  function openZoomedImage(imageUrl: string) {
    setZoomedImage(imageUrl);
    setSafeInteraction();
  }

  function closeZoomedImage() {
    setZoomedImage(null);
  }

  function handleTogglePinnedNote() {
    setIsPinned(!isPinned);
  }

  function handleToggleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
  }

  useClickOutsideHandler(
    notesFormModalWrapperRef,
    () => {
      if (!safeInteractionPeriod) {
        onSetShowNotesForm(false);
      }
    },
    isLoading ||
      showConfirmation ||
      editorDropdownIsOpen ||
      safeInteractionPeriod ||
      !!zoomedImage,
  );

  useClickOutsideHandler(
    zoomedImageWrapperRef,
    () => {
      setZoomedImage(null);
    },
    isLoading,
  );

  return (
    <div className="modal__container">
      <AnimatePresence>
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-10 h-[95%] overflow-y-scroll rounded-t-md bg-card"
          ref={notesFormModalWrapperRef}
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
            className="relative min-h-screen w-full rounded-t-md border-t pb-[6rem] shadow-sm"
            onSubmit={handleSubmitNote}
          >
            <button
              className="absolute right-4 top-4 disabled:cursor-not-allowed md:right-8 md:top-8"
              type="button"
              disabled={isLoading}
              onClick={onToggleShowNotesForm}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-5 transition-all hover:stroke-foreground/70"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="grid h-full gap-2 px-4 py-4 pb-4 md:px-24 md:py-16 md:pb-8">
              <div className="mt-6 columns-2 gap-2 md:mt-0 md:columns-4">
                {attachmentImagesNames.map((image, index) => (
                  <div key={image} className="relative">
                    {!isLoading && (
                      <button
                        type="button"
                        disabled={isLoading}
                        className="absolute left-1 top-1 rounded-full bg-black/70 p-1 disabled:cursor-not-allowed"
                        onClick={() => handleRemoveAttachmentImage(index)}
                      >
                        <svg
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
                    )}
                    <Image
                      src={image}
                      alt={image}
                      width={500}
                      height={500}
                      className="mb-2 w-auto cursor-pointer select-none break-inside-avoid rounded-md object-cover"
                      onClick={() => openZoomedImage(image)}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>
                ))}
                {currentAttachments.map((image, index) => (
                  <div key={image} className="relative">
                    {!isLoading && (
                      <button
                        type="button"
                        disabled={isLoading}
                        className="absolute left-1 top-1 rounded-full bg-black/70 p-1 disabled:cursor-not-allowed"
                        onClick={() =>
                          handleRemoveCurrentAttachmentImage(index)
                        }
                      >
                        <svg
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
                    )}
                    <Image
                      src={image}
                      alt={image}
                      width={500}
                      height={500}
                      className="mb-2 w-auto cursor-pointer select-none break-inside-avoid rounded-md object-cover"
                      onClick={() => openZoomedImage(image)}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>
                ))}
              </div>
              <input type="text" name="noteId" hidden defaultValue={note?.id} />
              <div>
                {note?.createdAt && (
                  <p className="text-xs text-foreground">{`Created ${formatDate(note.createdAt)}`}</p>
                )}
                <input
                  type="text"
                  name="title"
                  required={
                    editorState
                      ? false
                      : true ||
                        !currentAttachments.length ||
                        !attachmentImages.length
                  }
                  className="w-[90%] border-none bg-transparent text-4xl font-semibold focus:outline-none"
                  placeholder="Title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div>
                <Editor
                  editorSerializedState={editorState}
                  onSerializedChange={(value) => setEditorState(value)}
                  onDropdownStateChange={setEditorDropdownIsOpen}
                  onSafeInteraction={setSafeInteraction}
                />
              </div>
              {/* <textarea
                name="description"
                required={
                  title.length
                    ? false
                    : true ||
                      !currentAttachments.length ||
                      !attachmentImages.length
                }
                className="h-[40rem] resize-none border-none bg-transparent focus:outline-none md:h-[30rem]"
                placeholder="Note"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              ></textarea> */}
            </div>
            <div className="fixed bottom-0 left-0 right-0 flex w-auto items-center justify-between gap-4 border-t px-4 py-4 md:px-8">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="p-0 hover:bg-transparent"
                  asChild
                >
                  <label
                    className={` ${
                      isLoading
                        ? "disabled:cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                      disabled={isLoading}
                      onChange={(event) => {
                        handleAttachmentImageNameChange(event);
                        handleSetAttachmentImages(event);
                      }}
                    />
                    <ImagePlus className="size-5 md:size-6" />
                  </label>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="p-0 hover:bg-transparent"
                  onClick={handleTogglePinnedNote}
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
                    onClick={handleToggleShowConfirmation}
                  >
                    <Trash2 className="size-5 md:size-6" />
                    Delete
                  </Button>
                )}
                <Button
                  disabled={isLoading}
                  type="submit"
                  variant={type === "edit" ? "secondary" : "default"}
                >
                  {type === "edit" ? "Save changes" : "Create"}
                </Button>
              </div>
            </div>
          </form>
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
                  className="max-h-[90vh] max-w-[90vw] select-none object-contain"
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            </div>
          )}
          {showConfirmation && (
            <ConfirmationModal
              type="delete"
              btnLabel="Delete"
              isLoading={deleteNoteIsPending}
              handleCancel={handleToggleShowConfirmation}
              handleAction={() => onDeleteNote(note?.id ?? "")}
            >
              Are you sure your want remove this note?
            </ConfirmationModal>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
