"use client";

import React from "react";
import SpinnerMini from "@/components/SpinnerMini";

export default function SignInCredentialsButton({
  isLoading,
  children,
}: {
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#22317c] px-3 py-2 text-sm font-medium text-[#edf2ff] transition-colors hover:bg-[#384689] disabled:cursor-wait disabled:bg-[#1b2763] disabled:text-[#d5dae6]`}
      disabled={isLoading}
    >
      {isLoading && <SpinnerMini />}
      <span>{children}</span>
    </button>
  );
}
