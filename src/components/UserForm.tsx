"use client";

import { toast } from "sonner";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";

import { Session } from "@/lib/schema";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import { createUser, updateUser } from "@/lib/user-management-actions";

import { Button } from "@/components/ui/button";

export type UserRoleType = "user" | "admin";

export default function UserForm({
  type,
  user,
  onCheckEmail,
  onShowUserForm,
  onSetShowUserForm,
}: {
  type: "edit" | "create";
  user?: Session;
  onCheckEmail: (formData: FormData) => Promise<boolean>;
  onShowUserForm: () => void;
  onSetShowUserForm: Dispatch<SetStateAction<boolean>>;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const userFormModalWrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [userRole, setUserRole] = useState<UserRoleType>(
  //   (user?.role as UserRoleType) ?? "user",
  // );
  const [emailExists, setEmailExists] = useState(true);
  const [email, setEmail] = useState(user?.email ?? "");

  async function onCreateUser(formData: FormData) {
    const status = await createUser({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: "user",
      email_verified: true,
    });
    return status;
  }

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    if (user?.email !== email) {
      const status = await onCheckEmail(formData);
      setEmailExists(status);
      setIsLoading(false);
      if (!status) {
        toast.error("This email has already been taken.");
        return;
      }
    }
    formData.append("userRole", "user");
    const { success, message } = await (type === "create"
      ? onCreateUser(formData)
      : updateUser(formData));
    setIsLoading(false);
    if (success) {
      toast.success(message);
      onShowUserForm();
    } else toast.error(message);
  }

  useClickOutsideHandler(
    userFormModalWrapperRef,
    () => {
      onSetShowUserForm(false);
    },
    isLoading,
  );

  return (
    <div className="modal__container">
      <div
        className="fixed bottom-0 left-0 right-0 z-10 h-[95%] overflow-y-scroll rounded-t-md bg-[#f3f6ff]"
        ref={userFormModalWrapperRef}
      >
        <form
          className="min-h-screen w-full rounded-t-md border-t border-[#dddfe6] bg-[#f3f6ff] pb-[6rem] shadow-sm"
          onSubmit={handleCreateUser}
        >
          <div className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
            <h3 className="text-lg font-semibold tracking-tight">
              {type === "edit" ? "Edit " : "Create "} user
            </h3>
            <button
              className="disabled:cursor-not-allowed"
              type="button"
              disabled={isLoading}
              onClick={onShowUserForm}
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
            <input type="text" name="userId" defaultValue={user?.id} hidden />
          </div>
          <div className="grid gap-4 px-4 pb-4 md:px-8 md:pb-8">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                disabled={isLoading}
                required
                type="text"
                name="name"
                placeholder="Enter the user's name"
                defaultValue={user?.name}
                className="w-full rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 focus:border-[#384689] focus:outline-none"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Email address <span className="text-red-400">*</span>
              </label>
              <input
                disabled={isLoading}
                required
                type="email"
                name="email"
                placeholder="Set up user's email"
                value={email}
                className={`${!emailExists && "border-red-500"} w-full rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 focus:border-[#384689] focus:outline-none`}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="fixed bottom-0 left-0 right-0 flex w-auto items-center justify-end gap-2 border-t border-[#dddfe6] bg-[#f3f6ff] px-4 py-4 md:px-8">
              {!isLoading && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onShowUserForm}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {type === "edit" ? "Save changes" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
