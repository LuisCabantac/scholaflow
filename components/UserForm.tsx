"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

import { createUser, updateUser } from "@/lib/user-management-actions";

import Button from "@/components/Button";
import { IUser } from "@/components/UserManagementSection";

export type UserRoleType = "student" | "teacher";

export default function UserForm({
  type,
  user,
  onCheckEmail,
  onShowUserForm,
}: {
  type: "edit" | "create";
  user?: IUser;
  onCheckEmail: (formData: FormData) => Promise<boolean>;
  onShowUserForm: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [validPassword, setValidPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState<UserRoleType>(
    (user?.role as UserRoleType) ?? "student",
  );
  const [emailExists, setEmailExists] = useState(true);
  const [email, setEmail] = useState(user?.email ?? "");

  async function onCreateUser(formData: FormData) {
    const status = await createUser({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: userRole,
      verified: true,
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
      if (!status) {
        setIsLoading(false);
        toast.error("This email has already been taken.");
        return;
      }
    }
    formData.append("userRole", userRole);
    const { success, message } = await (type === "create"
      ? onCreateUser(formData)
      : updateUser(formData));
    if (success) {
      setIsLoading(false);
      toast.success(message);
      onShowUserForm();
    } else toast.error(message);
  }

  function handleShowPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowPassword(!showPassword);
  }

  return (
    <div className="modal__container">
      <div className="flex h-[40%] w-[80%] items-center justify-center md:h-[60%] md:w-[60%]">
        <form
          className="w-full rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] shadow-sm"
          onSubmit={handleCreateUser}
        >
          <div className="flex items-center justify-between px-4 py-4">
            <h3 className="text-xl font-medium md:text-2xl">
              {type === "edit" ? "Edit" : "Create"} user
            </h3>
            <input type="text" name="userId" defaultValue={user?.id} hidden />
          </div>
          <div className="grid gap-4 px-4 pb-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                disabled={isLoading}
                required
                type="text"
                name="fullName"
                placeholder="Enter the user's name"
                defaultValue={user?.fullName}
                className="w-full rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 focus:border-[#384689] focus:outline-none"
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
                className={`${!emailExists && "border-red-500"} w-full rounded-md border-2 border-[#dbe4ff] bg-transparent px-4 py-2 focus:border-[#384689] focus:outline-none`}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="flex">
                <input
                  required
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Set up the user's password"
                  disabled={isLoading}
                  className={`password__input rounded-y-md w-full rounded-l-md border-y-2 border-l-2 border-[#dbe4ff] bg-transparent px-4 py-2 focus:border-[#384689] focus:outline-none ${!validPassword && "border-[#f03e3e]"}`}
                  defaultValue={user?.password}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setValidPassword(
                      event.target.value.length >= 8 ? true : false,
                    )
                  }
                />
                <button
                  onClick={handleShowPassword}
                  className={`show__password rounded-r-md border-y-2 border-r-2 border-[#dbe4ff] py-3 pr-5 focus:outline-0 ${!validPassword && "border-[#f03e3e]"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    className="size-6 stroke-[#bec2cc]"
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
            </div>
            <div className="accent-[#22317c]">
              <label className="text-sm font-medium">
                Role <span className="text-red-400">*</span>
              </label>
              <div className="mt-2 flex flex-col">
                <label htmlFor="roleTeacher">
                  <div className="flex gap-2">
                    <input
                      disabled={isLoading}
                      type="radio"
                      id="roleTeacher"
                      name="role"
                      value="teacher"
                      onChange={(event) =>
                        setUserRole(event.target.value as UserRoleType)
                      }
                      checked={userRole === "teacher"}
                    />
                    Teacher
                  </div>
                </label>
                <label htmlFor="roleStudent">
                  <div className="flex gap-2">
                    <input
                      disabled={isLoading}
                      type="radio"
                      id="roleStudent"
                      name="role"
                      value="student"
                      onChange={(event) =>
                        setUserRole(event.target.value as UserRoleType)
                      }
                      checked={userRole === "student"}
                    />
                    Student
                  </div>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {!isLoading && (
                <Button type="secondary" onClick={onShowUserForm}>
                  Cancel
                </Button>
              )}
              <Button type="primary" isLoading={isLoading}>
                {type === "edit" ? "Save changes" : "Add"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
