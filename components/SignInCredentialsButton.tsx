"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import SpinnerMini from "@/components/SpinnerMini";

export default function SignInCredentialsButton({
  isLoading,
  children,
}: {
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`${pending || isLoading ? "py-[0.8rem]" : ""} flex w-full items-center justify-center rounded-md bg-[#22317c] px-5 py-3 text-sm font-semibold text-[#edf2ff] transition-colors hover:bg-[#384689] disabled:cursor-not-allowed disabled:bg-[#192563]`}
      disabled={pending}
    >
      <span>{pending || isLoading ? <SpinnerMini /> : children}</span>
    </button>
  );
}
