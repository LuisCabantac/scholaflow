"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";

import ConfirmationScreen from "@/components/ConfirmationScreen";

export default function UserCard({
  sessionId,
  id,
  fullName,
  avatar,
  email,
  role,
  createdAt,
  verified,
  onDeleteUser,
  deleteUserIsPending,
}: {
  sessionId: string;
  id: string;
  fullName: string;
  avatar: string;
  email: string;
  role: string;
  createdAt: string;
  verified: boolean;
  onDeleteUser: (userId: string) => void;
  deleteUserIsPending: boolean;
}) {
  const [ellipsis, setEllipsis] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  function handleToggleEllipsis() {
    setEllipsis(!ellipsis);
  }

  function handleCloseEllipsis() {
    setEllipsis(false);
  }

  function handleToggleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
  }

  return (
    <tr className="bg-[#f3f6ff]" onMouseLeave={handleCloseEllipsis}>
      <td data-cell="Name:" className="flex items-center gap-2 px-4 py-2">
        <Image
          src={avatar}
          alt={fullName}
          width={30}
          height={30}
          className="rounded-full"
        />

        <p className="text-balance font-medium">{fullName}</p>
      </td>
      <td data-cell="Email:" className="px-4 py-2">
        <p>{email}</p>
      </td>
      <td data-cell="Role:" className="px-4 py-2">
        <span
          className={`role flex w-24 items-center justify-center rounded-md p-1 text-[0.65rem] font-semibold md:p-2 md:text-xs ${role === "admin" ? "admin" : role === "teacher" ? "teacher" : role === "student" ? "student" : "guest"}`}
        >
          {role.toUpperCase()}
        </span>
      </td>
      <td data-cell="Date added:" className="px-4 py-2">
        {format(new Date(createdAt), "MMMM d, yyyy")}
      </td>
      <td data-cell="Verified:" className="px-4 py-2">
        {verified ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            className="size-5 stroke-[#69db7c]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            className="size-5 stroke-[#f03e3e]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        )}
      </td>
      <td className="relative px-4 py-2">
        <div
          className="absolute -top-[12rem] right-2 cursor-pointer md:right-4 md:top-4"
          onClick={handleToggleEllipsis}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
            />
          </svg>
        </div>

        <div
          className={`${ellipsis ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute right-2 z-20 grid w-[10rem] gap-2 rounded-md bg-[#f3f6ff] p-3 font-medium shadow-md transition-all ease-in-out`}
        >
          <Link href={`/user/admin/user-management/edit-user/${id}`}>
            Edit user
          </Link>
          {id !== sessionId && (
            <button
              className="flex items-center gap-1 rounded-md text-sm text-[#f03e3e] hover:text-[#c92a2a] md:text-base"
              onClick={handleToggleShowConfirmation}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              <span>Remove user</span>
            </button>
          )}
        </div>
      </td>
      {showConfirmation && (
        <ConfirmationScreen
          type="delete"
          btnLabel="Remove"
          isLoading={deleteUserIsPending}
          handleCancel={handleToggleShowConfirmation}
          handleAction={() => onDeleteUser(id)}
        >
          Are you sure you want to remove this user?
        </ConfirmationScreen>
      )}
    </tr>
  );
}
