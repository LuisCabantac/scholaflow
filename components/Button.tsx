"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import SpinnerMini from "@/components/SpinnerMini";

const primaryStyle: string =
  "bg-[#22317c] text-[#edf2ff] hover:bg-[#384689] md:px-5 md:py-3 px-4 py-2";
const secondaryStyle: string =
  "border-[#ced8f7] border-2 text-[#22317c] disabled:bg-[#c5cde6] hover:border-[#c2cef1] hover:bg-[#ced8f7] md:px-[1.12rem] px-[1rem] md:py-[0.65rem] py-[0.5rem]";

export default function Button({
  type,
  href,
  onClick,
  children,
}: {
  type: string;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  if (href)
    return (
      <Link
        href={href}
        className={`${type === "primary" ? primaryStyle : secondaryStyle} flex items-center gap-1 rounded-md text-xs font-semibold transition-colors md:gap-2 md:text-sm`}
      >
        {children}
      </Link>
    );

  if (onClick)
    return (
      <button
        onClick={onClick}
        className={`${type === "primary" ? primaryStyle : secondaryStyle} flex items-center gap-1 rounded-md text-xs font-semibold transition-colors disabled:cursor-not-allowed md:gap-2 md:text-sm`}
        disabled={pending}
      >
        {children}
      </button>
    );

  return (
    <button
      className={`${type === "primary" ? primaryStyle : secondaryStyle} ${pending && "disabled:cursor-wait"} flex items-center gap-1 rounded-md text-xs font-semibold transition-colors md:gap-2 md:text-sm`}
      type="submit"
      disabled={pending}
    >
      {pending ? <SpinnerMini /> : children}
    </button>
  );
}
