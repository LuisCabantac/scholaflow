import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { useClickOutside } from "@/hooks/use-click-outside";
import type { Classroom, EnrolledClass } from "@/lib/schema";
import { classIllustration } from "@/lib/class-illustrations";

import UserAvatar from "@/components/shared/UserAvatar";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

export default function ClassroomCard({
  type,
  classData,
  onDeleteClass,
  deleteClassIsPending,
}: {
  type: "created" | "enrolled";
  classData: Classroom | EnrolledClass;
  onDeleteClass: (classId: string) => void;
  deleteClassIsPending: boolean;
}) {
  const { t } = useTranslation("classroom");

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ellipsis, setEllipsis] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const classId = "classId" in classData ? classData.classId : classData.id;
  const actionLabel =
    type === "created" ? t("actions.delete") : t("actions.unenroll");

  function handleToggleEllipsis(event: React.MouseEvent) {
    event.preventDefault();
    setEllipsis(!ellipsis);
  }

  function handleToggleShowConfirmation(event?: React.MouseEvent) {
    event?.preventDefault();
    setShowConfirmation(!showConfirmation);
  }

  useClickOutside(wrapperRef, () => setEllipsis(false), false);

  return (
    <li
      className="relative flex h-[9rem] w-full flex-col gap-2 rounded-xl text-[#F5F5F5] shadow-sm md:h-[10rem]"
      style={{ backgroundColor: classData.cardBackground }}
    >
      <Link
        to="/classroom/class/$classId"
        params={{ classId }}
        className="relative h-[9rem] md:h-[10rem]"
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="absolute top-3 left-3 w-[88%] text-balance drop-shadow-sm md:top-4 md:left-4">
          <h5 className="overflow-hidden text-lg font-semibold text-[#F5F5F5] text-ellipsis whitespace-nowrap">
            {classData.name}
          </h5>
          <p className="overflow-hidden font-medium text-[#F5F5F5] text-ellipsis whitespace-nowrap">
            {classData.subject && `${classData.subject} · `}
            {classData.section}
          </p>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-balance drop-shadow-sm md:bottom-4 md:left-4">
          <UserAvatar
            src={classData.teacherImage}
            width={24}
            height={24}
            alt={t("card.avatarAlt", { name: classData.teacherName })}
            className="h-6 w-6 shrink-0 rounded-full md:h-8 md:w-8"
          />
          <div>
            <p>{classData.teacherName}</p>
            <p className="text-xs font-medium">{t("card.instructor")}</p>
          </div>
        </div>
        <div className="absolute right-4 bottom-5 md:right-3 md:bottom-3">
          <svg
            aria-hidden="true"
            viewBox="0 0 64 64"
            className="w-24 -rotate-45 mix-blend-overlay"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeMiterlimit={10}
              strokeWidth={2}
              d={classIllustration(classData.illustrationIndex)}
            />
          </svg>
        </div>
        <div
          className="absolute top-3 right-3 md:top-4 md:right-4"
          ref={wrapperRef}
        >
          <button
            type="button"
            aria-label={t("card.menu")}
            onClick={handleToggleEllipsis}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
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
          <div
            className={`${ellipsis ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover border-border bg-card absolute right-2 z-20 grid w-[10rem] gap-2 rounded-xl border p-3 font-medium shadow-md transition-all ease-in-out`}
          >
            <button
              type="button"
              className="flex items-center gap-2 rounded-md text-[#f03e3e] transition-colors hover:text-[#c92a2a]"
              onClick={handleToggleShowConfirmation}
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </Link>
      {showConfirmation && (
        <ConfirmationModal
          type="delete"
          btnLabel={actionLabel}
          isLoading={deleteClassIsPending}
          handleCancel={handleToggleShowConfirmation}
          handleAction={() => {
            onDeleteClass(classId);
            handleToggleShowConfirmation();
          }}
        >
          {type === "created"
            ? t("confirm.deleteClass")
            : t("confirm.unenrollClass")}
        </ConfirmationModal>
      )}
    </li>
  );
}
