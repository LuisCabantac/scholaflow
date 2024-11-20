"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useClickOutside } from "@/contexts/ClickOutsideContext";

import SignOutButton from "@/components/SignOutButton";

export default function ProfileIcon({
  role,
  email,
  avatar,
  fullName,
}: {
  role: string;
  email: string;
  avatar: string;
  fullName: string;
}) {
  const [isOpenPopover, setIsOpenPopover] = useState(false);
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleToggleOpenPopover() {
    setIsOpenPopover(!isOpenPopover);
  }

  useClickOutsideHandler(
    wrapperRef,
    () => {
      setIsOpenPopover(false);
    },
    false,
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className="profile__icon flex cursor-pointer items-center gap-2 rounded-md transition-colors"
        onClick={handleToggleOpenPopover}
      >
        <div className="relative h-10 w-10 cursor-pointer rounded-full border-2 border-[#dbe4ff] transition-all">
          <Image
            src={avatar}
            alt="profile image"
            fill
            className="rounded-full object-cover"
          />
        </div>
      </div>
      <ul
        className={`${isOpenPopover ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute right-0 z-10 flex transform flex-col justify-center gap-1 rounded-md bg-[#f3f6ff] px-3 py-3 text-sm shadow-md transition-all ease-in-out md:text-base`}
      >
        <div className="relative flex cursor-default flex-col items-start gap-2 border-b-2 border-[#dbe4ff] px-2 pb-2">
          <div className="flex gap-2 pb-2">
            <li className="relative h-10 w-10">
              <Image src={avatar} fill className="rounded-full" alt="avatar" />
            </li>
            <div className="flex flex-col items-start justify-start">
              <li className="flex items-center gap-1 text-sm font-semibold">
                <span className="flex-shrink-0">{fullName}</span>{" "}
                <span
                  className={`role mt-0.5 flex items-center justify-center rounded-md ${role === "admin" ? "admin" : role === "teacher" ? "teacher" : role === "student" ? "student" : "guest"} px-2 py-0.5 text-[0.6rem] font-bold uppercase`}
                >
                  {role}
                </span>
              </li>
              <li className="break-words text-xs text-[#6e7280]">{email}</li>
            </div>
          </div>
        </div>
        <li>
          <Link
            href="/user/profile"
            className="flex gap-[0.7rem] rounded-md py-2 pl-[0.3rem] pr-2 text-sm transition-colors hover:bg-[#d8e0f5]"
            onClick={handleToggleOpenPopover}
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-[#5c7cfa]">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <span>Profile</span>
          </Link>
        </li>
        <li>
          <SignOutButton />
        </li>
      </ul>
    </div>
  );
}
