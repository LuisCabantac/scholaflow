"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

import { uuidv4Id } from "@/lib/schema";
import { closeUserAccount } from "@/lib/auth-actions";

import SpinnerMini from "@/components/SpinnerMini";

export default function CloseAccountSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  if (!token) {
    router.push("/");
  }

  if (uuidv4Id.safeParse(token).error) {
    router.push("/");
  }

  async function confirmDeleteAccountAction(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const { success, message } = await closeUserAccount(token ?? "");

    setSuccess(success);
    setMessage(message);
    setIsLoading(false);
    if (success) {
      toast.success(message);
      router.push("/signin");
    } else {
      toast.error(message);
    }
  }

  return (
    <form className="grid gap-3 pb-3" onSubmit={confirmDeleteAccountAction}>
      {success && (
        <div className="text-muted-foreground flex gap-2 rounded-md border p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="mt-0.5 size-6 flex-shrink-0 stroke-[#37b24d]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
            />
          </svg>
          <span>{message}</span>
        </div>
      )}
      {success === false && success !== null && (
        <div className="text-muted-foreground flex gap-2 rounded-md border p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="mt-0.5 size-6 flex-shrink-0 stroke-[#f03e3e]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <span>{message}</span>
        </div>
      )}
      <button
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#22317c] px-4 py-2 text-sm font-medium text-[#edf2ff] transition-colors hover:bg-[#384689] disabled:cursor-not-allowed disabled:bg-[#1b2763] disabled:text-[#d5dae6]"
        disabled={isLoading}
        type="submit"
      >
        {isLoading && <SpinnerMini />}
        {isLoading ? "Closing account..." : "Permanently close account"}
      </button>
    </form>
  );
}
