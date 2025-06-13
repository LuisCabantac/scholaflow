import Image from "next/image";
import toast from "react-hot-toast";
import { Eye, EyeOff, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { Session } from "@/lib/schema";
import { updateProfile } from "@/lib/user-management-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfileForm({
  user,
  session,
  onToggleShowEditProfileForm,
  handleSetShowEditProfileForm,
}: {
  user: Session | null | undefined;
  session: Session;
  onToggleShowEditProfileForm: () => void;
  handleSetShowEditProfileForm: Dispatch<SetStateAction<boolean>>;
}) {
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const editProfileFormModalWrapperRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>(
    user?.image ?? "",
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmitEditProfile(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    if (attachment) {
      formData.append("attachment", attachment);
    }
    const { success, message } = await updateProfile(formData);
    setIsLoading(false);
    if (success) {
      toast.success(message);
      onToggleShowEditProfileForm();
      queryClient.invalidateQueries({
        queryKey: [`profile--${session.id}`],
      });
    } else toast.error(message);
  }

  function handleSetAttachment(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        event.target.value = "";
        return;
      }
      setAttachment(file);
    } else {
      setAttachment(null);
    }
  }

  function handleSetAttachmentPreview(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAttachmentPreview(reader.result.toString());
        }
      };
      reader.readAsDataURL(selectedFile);
    }
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

  useClickOutsideHandler(
    editProfileFormModalWrapperRef,
    () => {
      handleSetShowEditProfileForm(false);
    },
    isLoading,
  );

  return (
    <div className="modal__container">
      <AnimatePresence>
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-10 h-[95%] overflow-y-scroll rounded-t-md border-t bg-card"
          ref={editProfileFormModalWrapperRef}
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
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Edit profile
              </h3>
              <button
                className="disabled:cursor-not-allowed"
                type="button"
                disabled={isLoading}
                onClick={onToggleShowEditProfileForm}
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
            <div className="grid gap-2 px-4 pb-4 md:gap-4 md:px-8 md:pb-8">
              <input type="text" name="userId" defaultValue={user?.id} hidden />
              <div className="grid gap-2">
                <div className="flex items-center gap-4">
                  <Image
                    src={attachmentPreview}
                    alt={`${user?.name}'s image`}
                    width={48}
                    height={48}
                    className="h-12 w-12 flex-shrink-0 rounded-full"
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
                        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                        disabled={isLoading}
                        onChange={(event) => {
                          handleSetAttachment(event);
                          handleSetAttachmentPreview(event);
                        }}
                      />
                      <Upload />
                      Upload photo
                    </label>
                  </Button>
                </div>
              </div>
              <h4 className="text-lg font-medium text-foreground">
                Personal Information
              </h4>
              <div className="mt-2 grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Full name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    disabled={isLoading}
                    name="name"
                    type="text"
                    defaultValue={user?.name ?? ""}
                    placeholder="Add your full name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    readOnly
                    name="email"
                    type="email"
                    defaultValue={user?.email ?? ""}
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schoolName">School</Label>
                  <Input
                    disabled={isLoading}
                    name="schoolName"
                    type="text"
                    defaultValue={user?.schoolName ?? ""}
                    placeholder="Add your school's name"
                  />
                </div>
              </div>
              <h4 className="mt-4 text-lg font-medium text-foreground">
                Change password
              </h4>
              <div className="mt-2 grid items-center gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label
                    htmlFor="currentPassword"
                    className="flex items-center justify-between gap-2"
                  >
                    Current Password
                    <span className="hidden text-xs text-foreground/70 md:flex">
                      Note: Leave empty if using Google/OAuth login.
                    </span>
                  </Label>
                  <span className="text-xs text-foreground/70 md:hidden">
                    Note: Leave empty if using Google/OAuth login.
                  </span>
                  <label className="group flex items-center gap-2 rounded-xl border bg-foreground/10 text-sm focus-within:border-ring group-disabled:cursor-not-allowed group-disabled:opacity-50">
                    <Input
                      name="currentPassword"
                      disabled={isLoading}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      className="border-0 bg-transparent shadow-none drop-shadow-none focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="pr-0 hover:bg-transparent"
                      onClick={handleShowPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="mb-0.5 mr-4 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4" />
                      ) : (
                        <Eye className="mb-0.5 mr-4 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4" />
                      )}
                    </Button>
                  </label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <label className="group flex items-center gap-2 rounded-xl border bg-foreground/10 text-sm focus-within:border-ring group-disabled:cursor-not-allowed group-disabled:opacity-50">
                    <Input
                      name="newPassword"
                      disabled={isLoading}
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Set up your new password"
                      className="border-0 bg-transparent shadow-none drop-shadow-none focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="pr-0 hover:bg-transparent"
                      onClick={handleShowNewPassword}
                    >
                      {showNewPassword ? (
                        <EyeOff className="mb-0.5 mr-4 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4" />
                      ) : (
                        <Eye className="mb-0.5 mr-4 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4" />
                      )}
                    </Button>
                  </label>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmNewPassword">
                    Confirm New Password
                  </Label>
                  <label className="group flex items-center gap-2 rounded-xl border bg-foreground/10 text-sm focus-within:border-ring group-disabled:cursor-not-allowed group-disabled:opacity-50">
                    <Input
                      name="confirmNewPassword"
                      disabled={isLoading}
                      type={showConfirmNewPassword ? "text" : "password"}
                      placeholder="Set up your new password"
                      className="border-0 bg-transparent shadow-none drop-shadow-none focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="pr-0 hover:bg-transparent"
                      onClick={handleShowConfirmNewPassword}
                    >
                      {showConfirmNewPassword ? (
                        <EyeOff className="mb-0.5 mr-4 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4" />
                      ) : (
                        <Eye className="mb-0.5 mr-4 h-5 w-5 stroke-muted-foreground md:h-4 md:w-4" />
                      )}
                    </Button>
                  </label>
                </div>
              </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 flex w-auto items-center justify-end gap-2 border-t px-4 py-4 md:px-8">
              <Button type="submit" disabled={isLoading}>
                Save changes
              </Button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
