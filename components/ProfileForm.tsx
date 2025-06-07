import Image from "next/image";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { Session } from "@/lib/schema";
import { updateProfile } from "@/lib/user-management-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import Button from "@/components/Button";

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
  const [isLoading, setIsLoading] = useState(false);

  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>(
    user?.image ?? "",
  );

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
                name="name"
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
                readOnly
                name="email"
                type="email"
                defaultValue={user?.email ?? ""}
                placeholder="Update your email address..."
                className="rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572]"
              />
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 flex w-auto items-center justify-end gap-2 border-t border-[#dddfe6] bg-[#f3f6ff] px-4 py-4 md:px-8">
            <Button type="primary" isLoading={isLoading}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
