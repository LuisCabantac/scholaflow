import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { Session } from "@/lib/schema";
import { updateProfile } from "@/lib/user-management-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function EditProfileForm({
  user,
  session,
  onCloseProfile,
  onToggleShowEditProfileForm,
  handleSetShowEditProfileForm,
}: {
  user: Session | null | undefined;
  session: Session;
  onToggleShowEditProfileForm: () => void;
  onCloseProfile: (userId: string) => Promise<void>;
  handleSetShowEditProfileForm: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const editProfileFormModalWrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosingAccount, setIsClosingAccount] = useState(false);

  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>(
    user?.image ?? "",
  );
  // const [showPassword, setShowPassword] = useState(false);
  // const [validPassword, setValidPassword] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      setAttachment(event.target.files[0]);
    } else setAttachment(null);
  }

  function handleSetAttachmentPreview(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAttachmentPreview(reader.result.toString());
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  // function handleShowPassword(event: React.MouseEvent<HTMLButtonElement>) {
  //   event.preventDefault();
  //   setShowPassword(!showPassword);
  // }

  function handleToggleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
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
      <div
        className="fixed bottom-0 left-0 right-0 z-10 h-[95%] overflow-y-scroll rounded-t-md border-t border-[#dddfe6] bg-[#f3f6ff]"
        ref={editProfileFormModalWrapperRef}
      >
        <form
          className="relative min-h-screen w-full pb-[6rem]"
          onSubmit={handleSubmitEditProfile}
        >
          <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
            <h3 className="text-lg font-semibold tracking-tight">
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
          <div className="grid gap-2 px-4 pb-4 md:gap-4 md:px-8 md:pb-8">
            <input type="text" name="userId" defaultValue={user?.id} hidden />
            <div className="grid gap-2">
              <label className="font-medium">Profile photo</label>
              <div className="flex items-center gap-2">
                <Image
                  src={attachmentPreview}
                  alt={`${user?.name}'s image`}
                  width={48}
                  height={48}
                  className="h-12 w-12 flex-shrink-0 rounded-full"
                />
                <label
                  className={`font-medium text-[#22317c] hover:text-[#384689] disabled:text-[#1b2763] ${
                    isLoading ? "disabled:cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
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
                  Change photo
                </label>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="font-medium">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                required
                disabled={isLoading}
                name="fullName"
                type="text"
                defaultValue={user?.name ?? ""}
                placeholder="Add your full name..."
                className="rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572]"
              />
            </div>
            <div className="grid gap-2">
              <label className="font-medium">School</label>
              <input
                disabled={isLoading}
                name="schoolName"
                type="text"
                defaultValue={user?.schoolName ?? ""}
                placeholder="Add your school's name..."
                className="rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572]"
              />
            </div>
            <div className="grid gap-2">
              <label className="font-medium">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                required
                disabled
                name="email"
                type="email"
                defaultValue={user?.email ?? ""}
                placeholder="Update your email address..."
                className="rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572]"
              />
            </div>
            {/* <div className="grid gap-2">
              <label className="font-medium">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="flex">
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Set up the user's password"
                  disabled={isLoading}
                  className={`password__input rounded-y-md w-full rounded-l-md border-y border-l border-[#dddfe6] bg-transparent px-4 py-2 focus:border-[#384689] focus:outline-none ${!validPassword && "border-[#f03e3e]"}`}
                  defaultValue={user?.password}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setValidPassword(
                      event.target.value.length >= 8 ? true : false,
                    )
                  }
                />
                <button
                  onClick={handleShowPassword}
                  className={`show__password rounded-r-md border-y border-r border-[#dddfe6] py-2 pr-4 focus:outline-0 ${!validPassword && "border-[#f03e3e]"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    className="size-6 stroke-[#616572]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div> */}
          </div>
          <div className="fixed bottom-0 left-0 right-0 flex w-auto items-center justify-between gap-2 border-t border-[#dddfe6] bg-[#f3f6ff] px-4 py-4 md:px-8">
            <button
              type="button"
              disabled={isLoading}
              className="flex h-10 items-center gap-1 rounded-md bg-[#e1e7f5] px-4 py-2 text-sm font-medium text-[#f03e3e] shadow-sm transition-colors hover:bg-[#d9dfee] hover:text-[#c92a2a] disabled:cursor-not-allowed disabled:bg-[#c5cde6]"
              onClick={handleToggleShowConfirmation}
            >
              Close account
            </button>
            {!isClosingAccount && (
              <Button type="primary" isLoading={isLoading}>
                Save changes
              </Button>
            )}
          </div>
        </form>
        {showConfirmation && (
          <ConfirmationModal
            type="delete"
            btnLabel="Close account"
            isLoading={isLoading}
            handleCancel={handleToggleShowConfirmation}
            handleAction={() => {
              setIsLoading(true);
              setIsClosingAccount(true);
              onCloseProfile(session.id);
              router.push("/");
            }}
          >
            Are you sure your want to close your account?
          </ConfirmationModal>
        )}
      </div>
    </div>
  );
}
