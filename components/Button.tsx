"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import SpinnerMini from "@/components/SpinnerMini";

const primaryStyle: string =
  "bg-[#22317c] text-[#edf2ff] hover:bg-[#384689] px-5 py-3";
const secondaryStyle: string =
  "border-[#ced8f7] border-2 text-[#22317c] disabled:bg-[#c5cde6] hover:border-[#c2cef1] hover:bg-[#ced8f7] px-[1.12rem] py-[0.65rem]";

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

  if (href && !pending)
    return (
      <Link
        href={href}
        className={`${type === "primary" ? primaryStyle : secondaryStyle} flex items-center gap-1 rounded-md text-sm font-semibold transition-colors md:gap-2`}
      >
        {children}
      </Link>
    );

  if (href && pending)
    return (
      <button
        className={`${type === "primary" ? primaryStyle : secondaryStyle} ${pending && "disabled:cursor-wait"} flex items-center gap-1 rounded-md text-sm font-semibold transition-colors md:gap-2`}
        type="submit"
        disabled={pending}
      >
        {children}
      </button>
    );

  if (onClick)
    return (
      <button
        onClick={onClick}
        className={`${type === "primary" ? primaryStyle : secondaryStyle} flex items-center gap-1 rounded-md text-sm font-semibold transition-colors disabled:cursor-not-allowed md:gap-2`}
        disabled={pending}
      >
        {children}
      </button>
    );

  return (
    <button
      className={`${type === "primary" ? primaryStyle : secondaryStyle} ${pending && "disabled:cursor-wait"} flex items-center gap-1 rounded-md text-sm font-semibold transition-colors md:gap-2`}
      type="submit"
      disabled={pending}
    >
      {pending ? <SpinnerMini /> : children}
    </button>
  );
}
