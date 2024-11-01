"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import SpinnerMini from "@/components/SpinnerMini";

const primaryStyle: string =
  "bg-[#22317c] hover:bg-[#384689] disabled:bg-[#1b2763] text-[#edf2ff] disabled:text-[#d5dae6] px-5 py-3";
const secondaryStyle: string =
  "text-[#22317c] border-[#dbe4ff] border-2 disabled:bg-[#c5cde6] bg-[#e1e7f5] hover:bg-[#d9dfee] px-[1.12rem] py-[0.65rem]";

export default function Button({
  type,
  href,
  bg,
  onClick,
  isLoading,
  children,
}: {
  type: string;
  href?: string;
  bg?: string;
  onClick?: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  if (href && !pending)
    return (
      <Link
        href={href}
        className={`${type === "primary" ? primaryStyle : secondaryStyle} flex items-center gap-1 rounded-md text-sm font-semibold shadow-sm transition-colors md:gap-2`}
      >
        {children}
      </Link>
    );

  if (href && pending)
    return (
      <button
        className={`${type === "primary" ? primaryStyle : secondaryStyle} ${pending && "disabled:cursor-wait"} flex items-center gap-1 rounded-md text-sm font-semibold shadow-sm transition-colors md:gap-2`}
        type="submit"
        disabled={pending}
      >
        {pending && <SpinnerMini />}
        {children}
      </button>
    );

  if (onClick)
    return (
      <button
        onClick={onClick}
        className={`${bg && type === "primary" ? `${bg} px-5 py-3 text-[#edf2ff]` : `${type === "primary" ? primaryStyle : secondaryStyle}`} ${isLoading && "disabled:cursor-wait"} flex items-center gap-1 rounded-md text-sm font-semibold shadow-sm transition-colors disabled:cursor-not-allowed md:gap-2`}
        disabled={isLoading}
      >
        {isLoading && <SpinnerMini />}
        {children}
      </button>
    );

  return (
    <button
      className={`${type === "primary" ? primaryStyle : secondaryStyle} ${isLoading && "disabled:cursor-wait"} flex items-center gap-1 rounded-md text-sm font-semibold shadow-sm transition-colors md:gap-2`}
      type="submit"
      disabled={isLoading}
    >
      {isLoading && <SpinnerMini />}
      {children}
    </button>
  );
}
