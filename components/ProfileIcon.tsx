"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import SignOutButton from "@/components/SignOutButton";

export default function ProfileIcon({
  avatar,
  email,
  fullName,
  role,
  school,
  course,
}: {
  avatar: string;
  email: string;
  fullName: string;
  role?: string;
  school?: string | null;
  course?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className="profile__icon flex cursor-pointer items-center gap-2 rounded-md transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative h-10 w-10 cursor-pointer rounded-full border-2 transition-all">
          <Image
            src={avatar}
            alt="profile image"
            fill
            className="rounded-full object-cover"
          />
        </div>
      </div>
      {isOpen ? (
        <ul className="absolute right-0 top-[1rem] z-10 flex translate-y-6 transform flex-col justify-center gap-1 rounded-md bg-[#f3f6ff] px-3 py-3 text-sm shadow-md transition duration-500 ease-in-out md:text-base">
          <div className="mb-2 flex cursor-default flex-col items-start gap-2 px-2">
            <div className="flex gap-2 pb-2">
              <li className="relative h-10 w-10">
                <Image
                  src={avatar}
                  fill
                  className="rounded-full"
                  alt="avatar"
                />
              </li>
              <div className="flex flex-col items-start justify-start gap-1">
                <li className="text-sm font-semibold">{fullName}</li>
                <li className="text-xs text-[#6e7280]">{email}</li>
              </div>
            </div>
            <div className="grid w-full gap-2 border-t-2 border-[#d6e0fd] pt-2">
              <li className="flex items-center justify-center rounded-md bg-[#354164] p-2 text-xs font-medium uppercase text-[#d6e0fd]">
                {role}
              </li>
              {school && (
                <li className="flex gap-2">
                  <svg viewBox="0 0 24 24" className="size-5 fill-[#5c7cfa]">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                    />
                  </svg>
                  <span className="text-sm font-medium">{school}</span>
                </li>
              )}
              {course && <li className="text-xs text-[#616572]">{course}</li>}
            </div>
          </div>
          <li className="border-t-2 border-[#d6e0fd] pt-2">
            <Link
              href="/user/profile"
              className="flex gap-[0.6rem] rounded-md px-[0.4rem] py-2 text-sm transition-colors hover:bg-[#c7d2f1]"
              onClick={() => setIsOpen(!isOpen)}
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
            <Link
              href="/user/dashboard"
              className="flex gap-[0.6rem] rounded-md px-[0.4rem] py-2 text-sm transition-colors hover:bg-[#c7d2f1]"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                viewBox="0 0 24 24"
                strokeWidth={2}
                className="size-5 fill-transparent stroke-[#5c7cfa]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 3 H9 A1 1 0 0 1 10 4 V11 A1 1 0 0 1 9 12 H4 A1 1 0 0 1 3 11 V4 A1 1 0 0 1 4 3 z"
                />
                <path d="M15 3 H20 A1 1 0 0 1 21 4 V7 A1 1 0 0 1 20 8 H15 A1 1 0 0 1 14 7 V4 A1 1 0 0 1 15 3 z" />
                <path d="M15 12 H20 A1 1 0 0 1 21 13 V20 A1 1 0 0 1 20 21 H15 A1 1 0 0 1 14 20 V13 A1 1 0 0 1 15 12 z" />
                <path d="M4 16 H9 A1 1 0 0 1 10 17 V20 A1 1 0 0 1 9 21 H4 A1 1 0 0 1 3 20 V17 A1 1 0 0 1 4 16 z" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <SignOutButton />
          </li>
        </ul>
      ) : null}
    </div>
  );
}
