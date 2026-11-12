import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useClickOutside } from "@/hooks/use-click-outside";
import type { Classroom, EnrolledClass } from "@/lib/schema";

import UserAvatar from "@/components/shared/UserAvatar";
import EllipsisPopover from "@/components/shared/EllipsisPopover";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

export default function PeopleCard({
  user,
  classroom,
  sessionId,
  onRemove,
  removeIsPending,
}: {
  user: EnrolledClass;
  classroom: Classroom;
  sessionId: string;
  onRemove: (enrolledClassId: string) => void;
  removeIsPending: boolean;
}) {
  const { t } = useTranslation("people");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ellipsis, setEllipsis] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useClickOutside(wrapperRef, () => setEllipsis(false), false);

  return (
    <li className="flex items-center justify-between py-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <UserAvatar
          src={user.userImage}
          alt={t("avatarAlt", { name: user.userName })}
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full select-none"
          onDragStart={(e) => e.preventDefault()}
        />
        <p className="min-w-0 [overflow-wrap:anywhere]">{user.userName}</p>
      </div>
      {classroom.teacherId === sessionId && (
        <div className="relative shrink-0" ref={wrapperRef}>
          <button
            type="button"
            onClick={() => setEllipsis(!ellipsis)}
            aria-label={t("card.menu")}
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
            showEdit={false}
            deleteLabel={t("card.remove")}
            showDelete={true}
            showEllipsis={ellipsis}
            onToggleEllipsis={() => setEllipsis(!ellipsis)}
            onShowConfirmationModal={() => setShowConfirmation(true)}
          />
          {showConfirmation && (
            <ConfirmationModal
              type="delete"
              btnLabel={t("card.removeButton")}
              isLoading={removeIsPending}
              handleCancel={() => setShowConfirmation(false)}
              handleAction={() => {
                onRemove(user.id);
                setShowConfirmation(false);
              }}
            >
              {t("card.confirmRemove")}
            </ConfirmationModal>
          )}
        </div>
      )}
    </li>
  );
}
