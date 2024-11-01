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
      className={`${isLoading && "py-[0.8rem]"} flex w-full items-center justify-center rounded-md bg-[#22317c] px-5 py-3 text-sm font-semibold text-[#edf2ff] transition-colors hover:bg-[#384689] disabled:cursor-wait disabled:bg-[#1b2763] disabled:text-[#d5dae6]`}
      disabled={isLoading}
    >
      <span>{isLoading ? <SpinnerMini /> : children}</span>
    </button>
  );
}
