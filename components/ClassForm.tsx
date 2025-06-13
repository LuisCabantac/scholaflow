"use client";

import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { Classroom, Session } from "@/lib/schema";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import { createClass, updateClass } from "@/lib/classroom-actions";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPicker } from "@/components/ui/color-picker";
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
  const [showColorPicker, setShowColorPicker] = useState(false);

  async function handleSubmitClass(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    formData.append("color", cardBackground);
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
    isLoading || showConfirmation || showColorPicker,
  );

  return (
    <>
      <div className="modal__container">
        <AnimatePresence>
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-10 h-[95%] overflow-y-scroll rounded-t-2xl bg-card"
            ref={classFormModalWrapperRef}
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
              className="min-h-screen w-full rounded-t-md border-t bg-card pb-[6rem] shadow-sm"
              onSubmit={handleSubmitClass}
            >
              <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
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
                    className="size-5 transition-all hover:stroke-foreground"
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
                        <Label className="flex items-center gap-2">
                          <ColorPicker
                            value={cardBackground}
                            className="size-4"
                            onChange={(color) => setCardBackground(color)}
                            onSetOpen={setShowColorPicker}
                          />
                          Change color
                        </Label>
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
                    <Label htmlFor="className">
                      Class name <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      required
                      type="text"
                      name="className"
                      placeholder="Add your class name"
                      value={className}
                      onChange={(event) => setClassName(event.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="section">
                      Section <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      required
                      type="text"
                      name="section"
                      placeholder="Add your subject name"
                      value={section}
                      onChange={(event) => setSection(event.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {type === "create" && (
                    <div className="grid gap-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        type="text"
                        name="subject"
                        placeholder="Add your class subject"
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
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        type="text"
                        name="subject"
                        placeholder="Add your class subject"
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="classDescription">Description</Label>
                      <Textarea
                        name="classDescription"
                        className="h-[10rem] w-full resize-none rounded-xl bg-foreground/10 px-4 py-2"
                        placeholder="Add your class description"
                        defaultValue={classroom?.description ?? ""}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Class code</Label>
                      <div className="flex items-center justify-between">
                        <p
                          className="cursor-pointer text-lg text-sidebar-ring"
                          onClick={async () => {
                            await navigator.clipboard
                              .writeText(classroom?.code ?? "")
                              .then(() =>
                                toast.success("Copied to clipboard!"),
                              );
                          }}
                        >
                          {classroom?.code}
                        </p>
                        <Button
                          variant="outline"
                          className="bg-transparent"
                          type="button"
                          onClick={handleToggleUpdateClassCode}
                          disabled={updateClassCode || isLoading}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Invite link</Label>
                      <div className="flex items-center justify-between">
                        <p
                          className="cursor-pointer text-lg text-sidebar-ring"
                          onClick={async () => {
                            await navigator.clipboard
                              .writeText(
                                `${process.env.NEXT_PUBLIC_APP_URL}/join-class/${classroom?.code}`,
                              )
                              .then(() =>
                                toast.success("Copied to clipboard!"),
                              );
                          }}
                        >
                          {`${process.env.NEXT_PUBLIC_APP_URL}/join-class/${classroom?.code}`}
                        </p>
                      </div>
                    </div>
                    <h5 className="text-sm font-medium text-foreground">
                      Stream settings
                    </h5>
                    <div className="mb-2 grid gap-2">
                      <Label className="flex items-center gap-2">
                        <Checkbox
                          name="allowStudentsToPost"
                          value={allowStudentsToPost.toString()}
                          disabled={isLoading}
                          checked={allowStudentsToPost}
                          onCheckedChange={(check) =>
                            setAllowStudentsToPost(check === true)
                          }
                        />
                        <span>Allow students to post</span>
                      </Label>
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2">
                        <Checkbox
                          name="allowStudentsToComment"
                          value={allowStudentsToComment.toString()}
                          checked={allowStudentsToComment}
                          disabled={isLoading}
                          onCheckedChange={(check) =>
                            setAllowStudentsToComment(check === true)
                          }
                        />
                        <span>Allow students to comment</span>
                      </Label>
                    </div>
                  </div>
                )}
              </div>
              <div className="fixed bottom-0 left-0 right-0 flex w-auto items-center justify-end gap-2 border-t bg-card px-4 py-4 md:px-8">
                {type === "edit" && !isLoading ? (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={handleToggleShowConfirmation}
                  >
                    Delete class
                  </Button>
                ) : null}
                <div className="flex gap-2">
                  {!isLoading && type === "create" && (
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={onToggleShowClassForm}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant={type === "edit" ? "secondary" : "default"}
                    disabled={isLoading}
                  >
                    {type === "edit" ? "Save changes" : "Create"}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
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
