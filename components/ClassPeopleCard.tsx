import Image from "next/image";
import { useRef, useState } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { IClass } from "@/components/ClassroomSection";
import ConfirmationModal from "@/components/ConfirmationModal";
import EllipsisPopover from "@/components/EllipsisPopover";

export default function ClassPeopleCard({
  user,
  classroom,
  sessionId,
  handleDeleteClass,
  deleteClassIsPending,
}: {
  user: IClass;
  classroom: IClass;
  sessionId: string;
  handleDeleteClass: UseMutateFunction<void, Error, string, unknown>;
  deleteClassIsPending: boolean;
}) {
  const { useClickOutsideHandler } = useClickOutside();
  const [ellipsis, setEllipsis] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleToggleEllipsis() {
    setEllipsis(!ellipsis);
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
    <li className="flex items-center justify-between bg-[#f3f6ff] p-2">
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8">
          <Image
            src={user.userAvatar}
            alt={`${user.userName}'s image`}
            fill
            className="rounded-full"
          />
        </div>
        <p>{user.userName}</p>
      </div>
      {classroom.teacherId === sessionId && (
        <div
          className="relative cursor-pointer"
          ref={wrapperRef}
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
          <EllipsisPopover
            showEdit={false}
            deleteLabel="Remove user"
            showDelete={true}
            showEllipsis={ellipsis}
            onToggleEllipsis={handleToggleEllipsis}
            onShowConfirmationModal={handleToggleShowConfirmation}
          />
          {showConfirmation && (
            <ConfirmationModal
              type="delete"
              btnLabel="Remove"
              isLoading={deleteClassIsPending}
              handleCancel={handleToggleShowConfirmation}
              handleAction={() => {
                handleDeleteClass(user.id);
                handleToggleShowConfirmation();
              }}
            >
              Are you sure you want to remove this user?
            </ConfirmationModal>
          )}
        </div>
      )}
    </li>
  );
}
