"use client";

import { Dispatch, SetStateAction, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Classroom, Session } from "@/lib/schema";
import { createClass, updateClass } from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function ClassForm({
  type,
  session,
  classroom,
  onDeleteClass,
  onSetShowClassForm,
  onToggleShowClassForm,
}: {
  type: "create" | "edit";
  session: Session;
  classroom?: Classroom;
  onDeleteClass: (classId: string) => Promise<void>;
  onSetShowClassForm: Dispatch<SetStateAction<boolean>>;
  onToggleShowClassForm: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const classFormModalWrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [className, setClassName] = useState(classroom?.name ?? "");
  const [section, setSection] = useState(classroom?.section ?? "");
  const [subject, setSubject] = useState(classroom?.subject ?? "");
  const [cardBackground, setCardBackground] = useState(
    classroom?.cardBackground ?? "#a7adcb",
  );
  const [allowStudentsToPost, setAllowStudentsToPost] = useState<boolean>(
    classroom?.allowUsersToPost ?? false,
  );
  const [allowStudentsToComment, setAllowStudentsToComment] = useState<boolean>(
    classroom?.allowUsersToComment ?? false,
  );
  const [updateClassCode, setUpdateClassCode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  async function handleSubmitClass(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const response = await (type === "create"
      ? createClass(formData)
      : updateClass(updateClassCode, formData));
    setIsLoading(false);
    if (response.success) {
      toast.success(response.message);

      queryClient.invalidateQueries({
        queryKey: [`class--${classroom?.id}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`createdClasses--${session.id}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`enrolledClasses--${session.id}`],
      });

      onToggleShowClassForm();
      if (response.classUrl) {
        router.push(response.classUrl);
      }
    } else {
      toast.error(response.message);
    }
  }

  function handleToggleUpdateClassCode() {
    setUpdateClassCode(!updateClassCode);
  }

  function handleToggleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
  }

  useClickOutsideHandler(
    classFormModalWrapperRef,
    () => {
      onSetShowClassForm(false);
    },
    isLoading || showConfirmation,
  );

  return (
    <>
      <div className="modal__container">
        <div
          className="fixed bottom-0 left-0 right-0 z-10 h-[95%] overflow-y-scroll rounded-t-md bg-[#f3f6ff]"
          ref={classFormModalWrapperRef}
        >
          <form
            className="min-h-screen w-full rounded-t-md border-t border-[#dddfe6] bg-[#f3f6ff] pb-[6rem] shadow-sm"
            onSubmit={handleSubmitClass}
          >
            <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
              <h3 className="text-lg font-semibold tracking-tight">
                {type === "edit" ? "Edit " : "Create "} class
              </h3>
              <button
                className="disabled:cursor-not-allowed"
                type="button"
                disabled={isLoading}
                onClick={onToggleShowClassForm}
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
            </div>
            <div
              className={`grid gap-4 px-4 pb-4 md:px-8 md:pb-8 ${type !== "create" && "md:grid-cols-2"}`}
            >
              <div className="flex flex-col justify-start gap-3">
                <div className="grid gap-2">
                  <input
                    type="text"
                    name="classroomId"
                    defaultValue={classroom?.id}
                    hidden
                  />
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Preview</label>
                    <div className="grid gap-2">
                      <label className="flex cursor-pointer items-center gap-1 text-sm font-medium">
                        <input
                          type="color"
                          name="color"
                          className="hidden"
                          disabled={isLoading}
                          value={cardBackground}
                          onChange={(event) =>
                            setCardBackground(event.target.value)
                          }
                        />
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
                            d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z"
                          />
                        </svg>
                        Change color
                      </label>
                    </div>
                  </div>
                  <div
                    className="relative h-[10rem] w-full rounded-md text-[#F5F5F5]"
                    style={{ backgroundColor: cardBackground }}
                  >
                    <div className="absolute left-3 top-3 text-balance drop-shadow-sm md:left-4 md:top-4">
                      <h5 className="text-lg font-semibold text-[#eeeeee] md:text-2xl">
                        {className.length > 40
                          ? className.slice(0, 40).concat("...")
                          : className}
                      </h5>
                      <p className="text-sm font-medium text-[#eeeeee] md:text-lg">
                        {subject && `${subject} · `}
                        {section.length > 40
                          ? section.slice(0, 40).concat("...")
                          : section}
                      </p>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-balance drop-shadow-sm md:bottom-4 md:left-4">
                      <Image
                        src={session.image ?? ""}
                        width={24}
                        height={24}
                        alt={`${session.name}'s avatar`}
                        className="h-6 w-6 flex-shrink-0 rounded-full md:h-8 md:w-8"
                      />

                      <div className="text-sm">
                        <p>{session.name}</p>
                        <p className="text-xs font-medium">Instructor</p>
                      </div>
                    </div>
                    <div className="absolute bottom-5 right-4">
                      <svg
                        viewBox="0 0 64 64"
                        className="w-20 -rotate-45 mix-blend-overlay md:w-28"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeMiterlimit={10}
                          strokeWidth={2}
                          d="M4 3h40v58H4zM34 3v57M8 16H0M8 8H0M8 24H0M8 32H0M8 40H0M8 48H0M8 56H0M55 1v53l4 8 4-8V1zM55 11h8"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Class name <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="className"
                    className="w-full rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none"
                    placeholder="Add your class name..."
                    value={className}
                    onChange={(event) => setClassName(event.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Section <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="section"
                    className="w-full rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none"
                    placeholder="Add a subject name..."
                    value={section}
                    onChange={(event) => setSection(event.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {type === "create" && (
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      className="w-full rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none"
                      placeholder="Add your class subject..."
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
              {type === "edit" && (
                <div className="flex flex-col gap-3">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      className="w-full rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none"
                      placeholder="Add your class subject..."
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Class description
                    </label>
                    <textarea
                      name="classDescription"
                      className="h-[5.3rem] w-full resize-none rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572]"
                      placeholder="Add a class description..."
                      defaultValue={classroom?.description ?? ""}
                    ></textarea>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Class code</label>
                    <div className="flex items-center justify-between">
                      <p
                        className="cursor-pointer text-lg text-[#5c7cfa]"
                        onClick={async () => {
                          await navigator.clipboard
                            .writeText(classroom?.code ?? "")
                            .then(() => toast.success("Copied to clipboard!"));
                        }}
                      >
                        {classroom?.code}
                      </p>
                      <button
                        className="text-sm text-[#384689] hover:text-[#384689] disabled:cursor-not-allowed disabled:text-[#1b2763]"
                        type="button"
                        onClick={handleToggleUpdateClassCode}
                        disabled={updateClassCode || isLoading}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Invite link</label>
                    <div className="flex items-center justify-between">
                      <p
                        className="cursor-pointer text-lg text-[#5c7cfa]"
                        onClick={async () => {
                          await navigator.clipboard
                            .writeText(
                              `${process.env.NEXT_PUBLIC_APP_URL}/join-class/${classroom?.code}`,
                            )
                            .then(() => toast.success("Copied to clipboard!"));
                        }}
                      >
                        {`${process.env.NEXT_PUBLIC_APP_URL}/join-class/${classroom?.code}`}
                      </p>
                    </div>
                  </div>
                  <h5 className="text-sm font-medium">Stream</h5>
                  <div className="grid gap-2">
                    <label className="flex gap-2 font-medium">
                      <input
                        type="checkbox"
                        name="allowStudentsToPost"
                        className="checked:accent-[#384689]"
                        value={allowStudentsToPost.toString()}
                        checked={allowStudentsToPost}
                        onChange={(event) =>
                          setAllowStudentsToPost(event.target.checked)
                        }
                        disabled={isLoading}
                      />
                      <span>Allow students to post</span>
                    </label>
                  </div>
                  <div className="grid gap-2">
                    <label className="flex gap-2 font-medium">
                      <input
                        type="checkbox"
                        name="allowStudentsToComment"
                        className="checked:accent-[#384689]"
                        value={allowStudentsToComment.toString()}
                        checked={allowStudentsToComment}
                        onChange={(event) =>
                          setAllowStudentsToComment(event.target.checked)
                        }
                        disabled={isLoading}
                      />
                      <span>Allow students to comment</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="fixed bottom-0 left-0 right-0 flex w-auto items-center justify-between gap-2 border-t border-[#dddfe6] bg-[#f3f6ff] px-4 py-4 md:px-8">
              {type === "edit" && !isLoading ? (
                <Button
                  type="secondary"
                  bg="text-[#f03e3e] hover:text-[#c92a2a] bg-[#e1e7f5] hover:bg-[#d9dfee] disabled:bg-[#c5cde6]"
                  onClick={handleToggleShowConfirmation}
                >
                  Delete class
                </Button>
              ) : (
                <div></div>
              )}
              <div className="flex gap-2">
                {!isLoading && type === "create" && (
                  <Button type="secondary" onClick={onToggleShowClassForm}>
                    Cancel
                  </Button>
                )}
                <Button type="primary" isLoading={isLoading}>
                  {type === "edit" ? "Save changes" : "Create"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {showConfirmation && type === "edit" && (
        <ConfirmationModal
          type="delete"
          btnLabel="Delete"
          isLoading={isLoading}
          handleAction={async () => {
            try {
              await onDeleteClass(classroom?.id ?? "");
              onToggleShowClassForm();
              toast.success("Class deleted successfully!");
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Failed to delete class.",
              );
            }
          }}
          handleCancel={handleToggleShowConfirmation}
        >
          Are you sure you wanna delete this class?
        </ConfirmationModal>
      )}
    </>
  );
}
