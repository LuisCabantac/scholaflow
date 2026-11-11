import { format } from "date-fns";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClientOnly } from "@tanstack/react-router";

import type { User } from "@/lib/schema";
import { useClickOutside } from "@/hooks/use-click-outside";

import UserForm from "@/components/user-management/UserForm";
import EllipsisPopover from "@/components/shared/EllipsisPopover";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

export default function UserCard({
  user,
  isSelf,
  onDeleteUser,
  deleteUserIsPending,
}: {
  user: User;
  isSelf: boolean;
  onDeleteUser: (userId: string) => void;
  deleteUserIsPending: boolean;
}) {
  const { t } = useTranslation("userManagement");

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [ellipsis, setEllipsis] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useClickOutside(wrapperRef, () => setEllipsis(false), false);

  return (
    <tr className="bg-card">
      <td
        data-cell={`${t("table.name")}:`}
        className="flex items-center gap-2 px-4 py-2"
      >
        <img
          src={user.image}
          alt={t("table.avatarAlt", { name: user.name })}
          width={30}
          height={30}
          className="h-[30px] w-[30px] shrink-0 rounded-full"
        />
        <p className="font-medium text-balance">{user.name}</p>
      </td>
      <td data-cell={`${t("table.email")}:`} className="px-4 py-2">
        <p>{user.email}</p>
      </td>
      <td data-cell={`${t("table.role")}:`} className="px-4 py-2">
        <span
          className={`role flex w-24 items-center justify-center rounded-md p-1 text-[0.65rem] font-semibold md:p-2 md:text-xs ${user.role === "admin" ? "admin" : "user"}`}
        >
          {user.role.toUpperCase()}
        </span>
      </td>
      <td data-cell={`${t("table.dateAdded")}:`} className="px-4 py-2">
        <ClientOnly fallback={null}>
          {format(new Date(user.createdAt), "MMMM d, yyyy")}
        </ClientOnly>
      </td>
      <td data-cell={`${t("table.verified")}:`} className="px-4 py-2">
        {user.emailVerified ? (
          <svg
            role="img"
            aria-label={t("table.verifiedYes")}
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
            role="img"
            aria-label={t("table.verifiedNo")}
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
          className="absolute -top-[11.5rem] right-2 md:top-3 md:right-4 md:left-0"
          ref={wrapperRef}
        >
          <button
            type="button"
            aria-label={t("table.options")}
            onClick={() => setEllipsis(!ellipsis)}
          >
            <svg
              aria-hidden="true"
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
            showEdit
            showDelete={!isSelf}
            deleteLabel={t("menu.removeUser")}
            showEllipsis={ellipsis}
            onShowEditForm={() => setShowUserForm(true)}
            onToggleEllipsis={() => setEllipsis(!ellipsis)}
            onShowConfirmationModal={() => setShowConfirmation(true)}
          />
        </div>
        {showConfirmation && (
          <ConfirmationModal
            type="delete"
            btnLabel={t("remove")}
            isLoading={deleteUserIsPending}
            handleCancel={() => setShowConfirmation(false)}
            handleAction={() => onDeleteUser(user.id)}
          >
            {t("confirmRemove")}
          </ConfirmationModal>
        )}
        {showUserForm && (
          <UserForm
            type="edit"
            user={user}
            onClose={() => setShowUserForm(false)}
          />
        )}
      </td>
    </tr>
  );
}
