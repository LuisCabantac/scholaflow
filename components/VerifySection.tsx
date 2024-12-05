"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { newVerification } from "@/lib/auth-actions";
import toast from "react-hot-toast";

export default function VerifySection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  if (!token) router.push("/");

  const onSubmit = useCallback(() => {
    newVerification(token ?? "").then((data) => {
      setIsLoading(false);
      if (data.success) {
        toast.success(data.message);
      } else toast.error(data.message);
      setSuccess(data.success);
      setMessage(data.message);
    });
  }, [token]);

  useEffect(() => {
    setIsLoading(true);
    onSubmit();
  }, [onSubmit]);

  return (
    <section className="z-10 mx-8 grid w-full gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-4 md:mx-60 md:w-[25rem]">
      <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold tracking-tight">
        Verify your email
      </h1>
      {isLoading && (
        <div className="flex gap-2">
          <div className="spinner__mini dark flex-shrink-0"></div>
          <span>Verifying...</span>
        </div>
      )}
      {success && (
        <div className="grid gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-5 flex-shrink-0 stroke-[#37b24d]"
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
    </section>
  );
}
