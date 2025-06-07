"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

import SpinnerMini from "@/components/SpinnerMini";
import { nanoidId } from "@/lib/schema";
import { updateUserPassword } from "@/lib/auth-actions";

export default function ResetPasswordSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [validPassword, setValidPassword] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get("token");

  if (!token) router.push("/");

  const tokenResult = nanoidId.safeParse(token);

  if (tokenResult.error) router.back();

  async function handleForgetPasswordAction(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    if (tokenResult.success) {
      const { success, message } = await updateUserPassword(
        tokenResult.data,
        formData,
      );
      if (success) {
        router.push("/signin");
        toast.success(message);
      } else {
        toast.error(message);
      }
    }
    setIsLoading(false);
  }

  function handleShowPassword(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowPassword(!showPassword);
  }

  return (
    <form className="grid gap-3 pb-3" onSubmit={handleForgetPasswordAction}>
      <div className="grid gap-2">
        <label className="font-medium">
          New password <span className="text-red-400">*</span>
        </label>
        <div className="flex">
          <input
            required
            disabled={isLoading}
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your new password"
            className={`password__input rounded-y-md w-full rounded-l-md border-y border-l border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed disabled:text-[#616572] ${validPassword ? "" : "border-[#f03e3e]"}`}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setValidPassword(event.target.value.length >= 8 ? true : false)
            }
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={handleShowPassword}
            className={`show__password rounded-r-md border-y border-r border-[#dddfe6] py-2 pr-4 focus:outline-0 disabled:cursor-not-allowed ${validPassword ? "" : "border-[#f03e3e]"}`}
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
        <button
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#22317c] px-4 py-2 text-sm font-medium text-[#edf2ff] transition-colors hover:bg-[#384689] disabled:cursor-not-allowed disabled:bg-[#1b2763] disabled:text-[#d5dae6]"
          disabled={isLoading}
          type="submit"
        >
          {isLoading && <SpinnerMini />}
          Reset Password
        </button>
      </div>
    </form>
  );
}
