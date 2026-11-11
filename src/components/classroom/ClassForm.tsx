import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import type { Classroom } from "@/lib/schema";
import { classroomKeys } from "@/queries/classroom";
import type { SessionUser } from "@/server/functions/auth";
import { useClickOutside } from "@/hooks/use-click-outside";
import {
  createClassFn,
  deleteClassFn,
  updateClassFn,
} from "@/server/functions/classroom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "@/components/ui/color-picker";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

function truncate(value: string, max: number) {
  return value.length > max ? value.slice(0, max).concat("...") : value;
}

export default function ClassForm({
  type,
  user,
  classroom,
  onClose,
}: {
  type: "create" | "edit";
  user: SessionUser;
  classroom?: Classroom;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation(["classroom", "common"]);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [section, setSection] = useState(classroom?.section ?? "");
  const [subject, setSubject] = useState(classroom?.subject ?? "");
  const [className, setClassName] = useState(classroom?.name ?? "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [updateClassCode, setUpdateClassCode] = useState(false);
  const [cardBackground, setCardBackground] = useState(
    classroom?.cardBackground ?? "#a7adcb",
  );
  const [allowStudentsToPost, setAllowStudentsToPost] = useState(
    classroom?.allowUsersToPost ?? false,
  );
  const [allowStudentsToComment, setAllowStudentsToComment] = useState(
    classroom?.allowUsersToComment ?? false,
  );

  const inviteLink =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/join-class/${classroom?.code ?? ""}`;

  async function copyToClipboard(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success(t("common:messages.copied"));
  }

  async function handleSubmitClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    formData.append("color", cardBackground);
    formData.append("updateClassCode", String(updateClassCode));
    const response = await (type === "create"
      ? createClassFn({ data: formData })
      : updateClassFn({ data: formData }));
    setIsLoading(false);

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);
    await queryClient.invalidateQueries({ queryKey: classroomKeys.all });
    onClose();
    if (response.classUrl) {
      await navigate({ href: response.classUrl });
    }
  }

  async function handleDeleteClass() {
    if (!classroom) return;
    setIsLoading(true);
    const response = await deleteClassFn({ data: classroom.id });
    setIsLoading(false);

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success(t("messages.deletedForm"));
    await queryClient.invalidateQueries({ queryKey: classroomKeys.all });
    onClose();
    await navigate({ to: "/classroom" });
  }

  useClickOutside(
    wrapperRef,
    onClose,
    isLoading || showConfirmation || showColorPicker,
  );

  return (
    <>
      <div className="modal__container">
        <AnimatePresence>
          <motion.div
            className="bg-card fixed right-0 bottom-0 left-0 z-10 h-[95%] overflow-y-scroll rounded-t-2xl"
            ref={wrapperRef}
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
              className="bg-card min-h-screen w-full rounded-t-md border-t pb-[6rem] shadow-sm"
              onSubmit={handleSubmitClass}
            >
              <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
                <h3 className="text-foreground text-lg font-semibold tracking-tight">
                  {type === "edit"
                    ? t("form.editTitle")
                    : t("form.createTitle")}
                </h3>
                <button
                  className="disabled:cursor-not-allowed"
                  type="button"
                  aria-label={t("form.close")}
                  disabled={isLoading}
                  onClick={onClose}
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="hover:stroke-foreground size-5 transition-all"
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
                className={`grid gap-4 px-4 pb-4 md:px-8 md:pb-8 ${type !== "create" ? "md:grid-cols-2" : ""}`}
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
                      <span className="text-sm font-medium">
                        {t("form.preview")}
                      </span>
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <ColorPicker
                            value={cardBackground}
                            className="size-4"
                            onChange={(color) => setCardBackground(color)}
                            onSetOpen={setShowColorPicker}
                          />
                          {t("actions.changeColor")}
                        </Label>
                      </div>
                    </div>
                    <div
                      className="relative h-[10rem] w-full rounded-md text-[#F5F5F5]"
                      style={{ backgroundColor: cardBackground }}
                    >
                      <div className="absolute top-3 left-3 text-balance drop-shadow-sm md:top-4 md:left-4">
                        <h5 className="text-lg font-semibold text-[#eeeeee] md:text-2xl">
                          {truncate(className, 40)}
                        </h5>
                        <p className="text-sm font-medium text-[#eeeeee] md:text-lg">
                          {subject && `${subject} · `}
                          {truncate(section, 40)}
                        </p>
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2 text-balance drop-shadow-sm md:bottom-4 md:left-4">
                        <img
                          src={user.image ?? ""}
                          width={24}
                          height={24}
                          alt={t("card.avatarAlt", { name: user.name })}
                          className="h-6 w-6 shrink-0 rounded-full md:h-8 md:w-8"
                        />
                        <div className="text-sm">
                          <p>{user.name}</p>
                          <p className="text-xs font-medium">
                            {t("card.instructor")}
                          </p>
                        </div>
                      </div>
                      <div className="absolute right-4 bottom-5">
                        <svg
                          aria-hidden="true"
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
                      {t("form.className")}{" "}
                      <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      required
                      id="className"
                      type="text"
                      name="className"
                      placeholder={t("form.placeholders.className")}
                      value={className}
                      onChange={(event) => setClassName(event.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="section">
                      {t("form.section")}{" "}
                      <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      required
                      id="section"
                      type="text"
                      name="section"
                      placeholder={t("form.placeholders.section")}
                      value={section}
                      onChange={(event) => setSection(event.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  {type === "create" && (
                    <div className="grid gap-2">
                      <Label htmlFor="subject">{t("form.subject")}</Label>
                      <Input
                        id="subject"
                        type="text"
                        name="subject"
                        placeholder={t("form.placeholders.subject")}
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
                      <Label htmlFor="subject">{t("form.subject")}</Label>
                      <Input
                        id="subject"
                        type="text"
                        name="subject"
                        placeholder={t("form.placeholders.subject")}
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="classDescription">
                        {t("form.description")}
                      </Label>
                      <Textarea
                        id="classDescription"
                        name="classDescription"
                        className="bg-foreground/10 h-[10rem] w-full resize-none rounded-xl px-4 py-2"
                        placeholder={t("form.placeholders.description")}
                        defaultValue={classroom?.description ?? ""}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{t("form.classCode")}</Label>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className="text-sidebar-ring cursor-pointer text-lg"
                          onClick={() => copyToClipboard(classroom?.code ?? "")}
                        >
                          {classroom?.code}
                        </button>
                        <Button
                          variant="outline"
                          className="bg-transparent"
                          type="button"
                          onClick={() => setUpdateClassCode(!updateClassCode)}
                          disabled={updateClassCode || isLoading}
                        >
                          {t("actions.reset")}
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>{t("form.inviteLink")}</Label>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className="text-sidebar-ring cursor-pointer text-lg"
                          onClick={() => copyToClipboard(inviteLink)}
                        >
                          {inviteLink}
                        </button>
                      </div>
                    </div>
                    <h5 className="text-foreground text-sm font-medium">
                      {t("form.streamSettings")}
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
                        <span>{t("form.allowPost")}</span>
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
                        <span>{t("form.allowComment")}</span>
                      </Label>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-card fixed right-0 bottom-0 left-0 flex w-auto items-center justify-end gap-2 border-t px-4 py-4 md:px-8">
                {type === "edit" && !isLoading ? (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => setShowConfirmation(true)}
                  >
                    {t("actions.deleteClass")}
                  </Button>
                ) : null}
                <div className="flex gap-2">
                  {!isLoading && type === "create" && (
                    <Button variant="secondary" type="button" onClick={onClose}>
                      {t("common:actions.cancel")}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant={type === "edit" ? "secondary" : "default"}
                    disabled={isLoading}
                  >
                    {type === "edit"
                      ? t("actions.saveChanges")
                      : t("actions.create")}
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
          btnLabel={t("actions.delete")}
          isLoading={isLoading}
          handleAction={handleDeleteClass}
          handleCancel={() => setShowConfirmation(false)}
        >
          {t("confirm.deleteClassShort")}
        </ConfirmationModal>
      )}
    </>
  );
}
