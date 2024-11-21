"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import SpinnerMini from "@/components/SpinnerMini";

const primaryStyle: string =
  "bg-[#22317c] hover:bg-[#384689] h-10 font-medium disabled:bg-[#1b2763] text-[#edf2ff] disabled:text-[#d5dae6] px-4 py-2";
const secondaryStyle: string =
  "text-[#22317c] disabled:bg-[#c5cde6] h-10 font-medium bg-[#e1e7f5] hover:bg-[#d9dfee] px-4 py-2";

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
        className={`${type === "primary" ? primaryStyle : secondaryStyle} flex items-center gap-1 rounded-md text-sm shadow-sm transition-colors md:gap-2`}
      >
        {children}
      </Link>
    );

  if (href && pending)
    return (
      <button
        className={`${type === "primary" ? primaryStyle : secondaryStyle} ${pending && "disabled:cursor-not-allowed"} flex items-center gap-1 rounded-md text-sm shadow-sm transition-colors md:gap-2`}
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
        className={`${bg && type === "primary" ? `${bg} px-4 py-2 text-[#edf2ff]` : `${type === "primary" ? primaryStyle : secondaryStyle}`} ${isLoading && "disabled:cursor-not-allowed"} flex items-center gap-1 rounded-md text-sm font-medium shadow-sm transition-colors disabled:cursor-not-allowed md:gap-2`}
        disabled={isLoading}
      >
        {isLoading && <SpinnerMini />}
        {children}
      </button>
    );

  return (
    <button
      className={`${type === "primary" ? primaryStyle : secondaryStyle} ${isLoading && "disabled:cursor-not-allowed"} flex items-center gap-1 rounded-md text-sm shadow-sm transition-colors md:gap-2`}
      type="submit"
      disabled={isLoading}
    >
      {isLoading && <SpinnerMini />}
      {children}
    </button>
  );
}
