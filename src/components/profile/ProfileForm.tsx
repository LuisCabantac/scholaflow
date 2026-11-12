import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import type { User } from "@/lib/schema";
import { authKeys } from "@/queries/auth";
import type { SessionUser } from "@/types/auth";
import { useClickOutside } from "@/hooks/use-click-outside";
import { updateProfileFn } from "@/server/functions/user-management";
import {
  AVATAR_ACCEPT,
  isAvatarTooLarge,
  passwordChangeError,
} from "@/lib/profile-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/shared/UserAvatar";

const passwordWrapperClass =
  "group flex items-center gap-2 rounded-xl border bg-foreground/10 text-sm focus-within:border-ring group-disabled:cursor-not-allowed group-disabled:opacity-50";
const passwordInputClass =
  "border-0 bg-transparent shadow-none drop-shadow-none focus-visible:ring-0";
const eyeClass = "mb-0.5 mr-4 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4";

export default function ProfileForm({
  profile,
  user,
  onClose,
}: {
  profile: User | null;
  user: SessionUser;
  onClose: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation("profile");

  const wrapperRef = useRef<HTMLDivElement>(null);

  const name = profile?.name ?? user.name;
  const email = profile?.email ?? user.email;
  const schoolName = profile?.schoolName ?? user.schoolName ?? "";

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState(
    profile?.image ?? user.image ?? "",
  );

  async function handleSubmitEditProfile(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const passwordError = passwordChangeError(
      {
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
        confirmNewPassword: String(formData.get("confirmNewPassword") ?? ""),
      },
      "",
    );

    if (passwordError) {
      toast.error(t(`form.messages.${passwordError}`));
      return;
    }

    if (attachment) formData.append("attachment", attachment);
    setIsLoading(true);

    try {
      const { success, message } = await updateProfileFn({ data: formData });

      if (!success) {
        toast.error(message);
        return;
      }

      toast.success(message);
      await queryClient.invalidateQueries({
        queryKey: authKeys.session(),
        refetchType: "all",
      });
      await queryClient.invalidateQueries();
      await router.invalidate();
      onClose();
    } catch {
      toast.error(t("form.messages.failed"));
    } finally {
      setIsLoading(false);
    }
  }

  function handleSetAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setAttachment(null);
      return;
    }

    if (isAvatarTooLarge(file)) {
      toast.error(t("form.messages.photoTooLarge"));
      event.target.value = "";
      return;
    }

    setAttachment(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setAttachmentPreview(reader.result.toString());
    };
    reader.readAsDataURL(file);
  }

  function handleShowPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowPassword(!showPassword);
  }

  function handleShowNewPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowNewPassword(!showNewPassword);
  }

  function handleShowConfirmNewPassword(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    setShowConfirmNewPassword(!showConfirmNewPassword);
  }

  useClickOutside(wrapperRef, onClose, isLoading);

  return (
    <div className="modal__container">
      <AnimatePresence>
        <motion.div
          className="bg-card fixed right-0 bottom-0 left-0 z-10 h-[95%] overflow-y-scroll rounded-t-md border-t"
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
            className="relative min-h-screen w-full pb-[6rem]"
            onSubmit={handleSubmitEditProfile}
          >
            <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
              <h3 className="text-foreground text-lg font-semibold tracking-tight">
                {t("form.title")}
              </h3>
              <button
                className="disabled:cursor-not-allowed"
                type="button"
                aria-label={t("actions.close")}
                disabled={isLoading}
                onClick={onClose}
              >
                <X className="hover:stroke-foreground size-5 transition-all" />
              </button>
            </div>
            <div className="grid gap-2 px-4 pb-4 md:gap-4 md:px-8 md:pb-8">
              <input type="text" name="userId" defaultValue={user.id} hidden />
              <div className="grid gap-2">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={attachmentPreview}
                    alt={t("form.imageAlt", { name })}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    className="bg-transparent"
                    asChild
                    disabled={isLoading}
                  >
                    <label>
                      <input
                        type="file"
                        className="hidden"
                        accept={AVATAR_ACCEPT}
                        disabled={isLoading}
                        onChange={handleSetAttachment}
                      />
                      <Upload />
                      {t("actions.uploadPhoto")}
                    </label>
                  </Button>
                </div>
              </div>
              <h4 className="text-foreground text-lg font-medium">
                {t("form.personal")}
              </h4>
              <div className="mt-2 grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    {t("form.fields.name")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    disabled={isLoading}
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={name}
                    placeholder={t("form.fields.namePlaceholder")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    {t("form.fields.email")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    readOnly
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={email}
                    placeholder={t("form.fields.emailPlaceholder")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schoolName">{t("form.fields.school")}</Label>
                  <Input
                    disabled={isLoading}
                    id="schoolName"
                    name="schoolName"
                    type="text"
                    defaultValue={schoolName}
                    placeholder={t("form.fields.schoolPlaceholder")}
                  />
                </div>
              </div>
              <h4 className="text-foreground mt-4 text-lg font-medium">
                {t("form.password")}
              </h4>
              <div className="mt-2 grid items-center gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label
                    htmlFor="currentPassword"
                    className="flex items-center justify-between gap-2"
                  >
                    {t("form.fields.currentPassword")}
                    <span className="text-foreground/70 hidden text-xs md:flex">
                      {t("form.fields.currentPasswordNote")}
                    </span>
                  </Label>
                  <span className="text-foreground/70 text-xs md:hidden">
                    {t("form.fields.currentPasswordNote")}
                  </span>
                  <label
                    htmlFor="currentPassword"
                    className={passwordWrapperClass}
                  >
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      disabled={isLoading}
                      type={showPassword ? "text" : "password"}
                      placeholder={t("form.fields.currentPasswordPlaceholder")}
                      className={passwordInputClass}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="pr-0 hover:bg-transparent"
                      onClick={handleShowPassword}
                    >
                      {showPassword ? (
                        <EyeOff className={eyeClass} />
                      ) : (
                        <Eye className={eyeClass} />
                      )}
                    </Button>
                  </label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">
                    {t("form.fields.newPassword")}
                  </Label>
                  <label htmlFor="newPassword" className={passwordWrapperClass}>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      disabled={isLoading}
                      type={showNewPassword ? "text" : "password"}
                      placeholder={t("form.fields.newPasswordPlaceholder")}
                      className={passwordInputClass}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="pr-0 hover:bg-transparent"
                      onClick={handleShowNewPassword}
                    >
                      {showNewPassword ? (
                        <EyeOff className={eyeClass} />
                      ) : (
                        <Eye className={eyeClass} />
                      )}
                    </Button>
                  </label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmNewPassword">
                    {t("form.fields.confirmNewPassword")}
                  </Label>
                  <label
                    htmlFor="confirmNewPassword"
                    className={passwordWrapperClass}
                  >
                    <Input
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      disabled={isLoading}
                      type={showConfirmNewPassword ? "text" : "password"}
                      placeholder={t("form.fields.newPasswordPlaceholder")}
                      className={passwordInputClass}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="pr-0 hover:bg-transparent"
                      onClick={handleShowConfirmNewPassword}
                    >
                      {showConfirmNewPassword ? (
                        <EyeOff className={eyeClass} />
                      ) : (
                        <Eye className={eyeClass} />
                      )}
                    </Button>
                  </label>
                </div>
              </div>
            </div>
            <div className="fixed right-0 bottom-0 left-0 flex w-auto items-center justify-end gap-2 border-t px-4 py-4 md:px-8">
              <Button type="submit" disabled={isLoading}>
                {t("actions.saveChanges")}
              </Button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
