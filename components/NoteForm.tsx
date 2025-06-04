"use client";

import Image from "next/image";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { formatDate } from "@/lib/utils";
import { Note, Session } from "@/lib/schema";
import { createNote, updateNote } from "@/lib/notes-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";
import ConfirmationModal from "@/components/ConfirmationModal";

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
  const [description, setDescription] = useState(note?.content ?? "");
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(
    note?.attachments ?? [],
  );
  const [attachmentImagesNames, setAttachmentImagesNames] = useState<string[]>(
    [],
  );
  const [attachmentImages, setAttachmentImages] = useState<File[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  async function handleSubmitNote(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
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
      setAttachmentImages((prevFiles) => [...prevFiles, ...files]);
    }
  }

  function handleAttachmentImageNameChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = event.target.files;
    if (files) {
      const newFileNames = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      );
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
      onSetShowNotesForm(false);
    },
    isLoading,
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
      <div
        className="fixed bottom-0 left-0 right-0 z-10 h-[95%] overflow-y-scroll rounded-t-md bg-[#f3f6ff]"
        ref={notesFormModalWrapperRef}
      >
        <form
          className="relative min-h-screen w-full rounded-t-md border-t border-[#dddfe6] bg-[#f3f6ff] pb-[6rem] shadow-sm"
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
              className="size-5 transition-all hover:stroke-[#656b70]"
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
                    className="mb-2 w-auto cursor-pointer break-inside-avoid rounded-md object-cover"
                    onClick={() => openZoomedImage(image)}
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
                      onClick={() => handleRemoveCurrentAttachmentImage(index)}
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
                    className="mb-2 w-auto cursor-pointer break-inside-avoid rounded-md object-cover"
                    onClick={() => openZoomedImage(image)}
                  />
                </div>
              ))}
            </div>
            <input type="text" name="noteId" hidden defaultValue={note?.id} />
            <div>
              {note?.createdAt && (
                <p className="text-xs text-[#616572]">{`Created ${formatDate(note.createdAt)}`}</p>
              )}
              <input
                type="text"
                name="title"
                required={
                  description.length
                    ? false
                    : true ||
                      !currentAttachments.length ||
                      !attachmentImages.length
                }
                className="w-[90%] border-none bg-transparent text-lg font-semibold focus:outline-none"
                placeholder="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <textarea
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
            ></textarea>
          </div>
          <div className="fixed bottom-0 left-0 right-0 flex w-auto items-center justify-end gap-4 border-t border-[#dddfe6] bg-[#f3f6ff] px-4 py-4 md:px-8">
            <label
              className={` ${
                isLoading ? "disabled:cursor-not-allowed" : "cursor-pointer"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-5 stroke-[#616572] md:size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </label>
            <button type="button" onClick={handleTogglePinnedNote}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`size-5 md:size-6 ${isPinned ? "stroke-[#5c7cfa]" : "stroke-[#616572]"}`}
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <path d="M9 4v6l-2 4v2h10v-2l-2-4V4M12 16v5M8 4h8" />
              </svg>
            </button>
            {type === "edit" && (
              <button
                type="button"
                className="disabled:cursor-not-allowed"
                disabled={isLoading || deleteNoteIsPending}
                onClick={handleToggleShowConfirmation}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-5 stroke-[#f03e3e] hover:stroke-[#c92a2a]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            )}
            <Button type="primary" isLoading={isLoading}>
              {type === "edit" ? "Save changes" : "Create"}
            </Button>
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
                className="max-h-[90vh] max-w-[90vw] object-contain"
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
      </div>
    </div>
  );
}
