"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Dispatch, SetStateAction, useRef, useState } from "react";

import { Session } from "@/lib/schema";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import UserForm from "@/components/UserForm";
import ConfirmationModal from "@/components/ConfirmationModal";
import EllipsisPopover from "@/components/EllipsisPopover";

export default function UserCard({
  userData,
  onDeleteUser,
  onCheckEmail,
  onSetShowUserForm,
  deleteUserIsPending,
}: {
  userData: Session;
  onCheckEmail: (formData: FormData) => Promise<boolean>;
  onDeleteUser: (userId: string) => void;
  onSetShowUserForm: Dispatch<SetStateAction<boolean>>;
  deleteUserIsPending: boolean;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ellipsis, setEllipsis] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  function handleToggleEllipsis() {
    setEllipsis(!ellipsis);
  }

  function handleToggleShowUserForm() {
    setShowUserForm(!showUserForm);
  }

  function handleToggleShowConfirmation() {
    setShowConfirmation(!showConfirmation);
  }

  useClickOutsideHandler(
    wrapperRef,
    () => {
      setEllipsis(false);
    },
    false,
  );

  return (
    <tr className="bg-[#f3f6ff]">
      <td data-cell="Name:" className="flex items-center gap-2 px-4 py-2">
        <Image
          src={userData.image ?? ""}
          alt={userData.name}
          width={30}
          height={30}
          className="rounded-full"
        />
        <p className="text-balance font-medium">{userData.name}</p>
      </td>
      <td data-cell="Email:" className="px-4 py-2">
        <p>{userData.email}</p>
      </td>
      <td data-cell="Role:" className="px-4 py-2">
        <span
          className={`role flex w-24 items-center justify-center rounded-md p-1 text-[0.65rem] font-semibold md:p-2 md:text-xs ${userData.role === "admin" ? "admin" : userData.role === "teacher" ? "teacher" : userData.role === "student" ? "student" : "guest"}`}
        >
          {userData.role.toUpperCase()}
        </span>
      </td>
      <td data-cell="Date added:" className="px-4 py-2">
        {format(new Date(userData.createdAt), "MMMM d, yyyy")}
      </td>
      <td data-cell="Verified:" className="px-4 py-2">
        {userData.emailVerified ? (
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
          className="absolute -top-[11.5rem] right-2 md:left-0 md:right-4 md:top-3"
          ref={wrapperRef}
        >
          <button onClick={handleToggleEllipsis}>
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
          </button>
          <EllipsisPopover
            showEdit={false}
            showDelete={true}
            deleteLabel="Remove user"
            showEllipsis={ellipsis}
            onShowEditForm={handleToggleShowUserForm}
            onToggleEllipsis={handleToggleEllipsis}
            onShowConfirmationModal={handleToggleShowConfirmation}
          />
        </div>
        {showConfirmation && (
          <ConfirmationModal
            type="delete"
            btnLabel="Remove"
            isLoading={deleteUserIsPending}
            handleCancel={handleToggleShowConfirmation}
            handleAction={() => onDeleteUser(userData.id)}
          >
            Are you sure you want to remove this user?
          </ConfirmationModal>
        )}
        {showUserForm && (
          <UserForm
            type="edit"
            user={userData}
            onSetShowUserForm={onSetShowUserForm}
            onCheckEmail={onCheckEmail}
            onShowUserForm={handleToggleShowUserForm}
          />
        )}
      </td>
    </tr>
  );
}
