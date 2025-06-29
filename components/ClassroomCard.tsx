"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Classroom, EnrolledClass } from "@/lib/schema";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

import ConfirmationModal from "@/components/ConfirmationModal";

const illustrationArr = [
  "M1 1h46v62H1zM9 63V2M14 15h28M14 21h28M63 3v50l-4 8-4-8V3zM55 7h-4v10",
  "M4 3h40v58H4zM34 3v57M8 16H0M8 8H0M8 24H0M8 32H0M8 40H0M8 48H0M8 56H0M55 1v53l4 8 4-8V1zM55 11h8",
  "M63 3v50l-4 8-4-8V3zM55 7h-4v10M42 15v46H1V3h29zM8 13h12M8 23h27M8 31h27M8 39h27M8 47h27",
  "M22 1h16v62H22zM31 12h7M38 22h-3M38 42h-3M31 32h7M31 52h7M16 63V10l-4-8-4 8v53zM16 53H8M56 3v50l-4 8-4-8V3zM48 7h-4v10",
  "M36 5V1h-8v4h-4l-2 8h20l-2-8zM14 13h36v46H14z",
];

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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ellipsis, setEllipsis] = useState(false);
  const { useClickOutsideHandler } = useClickOutside();
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleToggleEllipsis(event: React.MouseEvent) {
    event.preventDefault();
    setEllipsis(!ellipsis);
  }

  function handleToggleShowConfirmation(event?: React.MouseEvent) {
    event?.preventDefault();
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
    <li
      className="relative flex h-[9rem] w-full flex-col gap-2 rounded-xl text-[#F5F5F5] shadow-sm md:h-[10rem]"
      style={{
        backgroundColor: classData.cardBackground,
      }}
    >
      <Link
        href={`/classroom/class/${"classId" in classData ? classData.classId : classData.id}`}
        className="relative h-[9rem] md:h-[10rem]"
      >
        <div className="absolute left-3 top-3 w-[88%] text-balance drop-shadow-sm md:left-4 md:top-4">
          <h5 className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold text-[#F5F5F5]">
            {classData.name}
          </h5>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[#F5F5F5]">
            {classData.subject && `${classData.subject} · `}
            {classData.section}
          </p>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-balance drop-shadow-sm md:bottom-4 md:left-4">
          <Image
            src={classData.teacherImage}
            width={24}
            height={24}
            alt={`${classData.teacherName}'s avatar`}
            className="h-6 w-6 flex-shrink-0 rounded-full md:h-8 md:w-8"
          />
          <div>
            <p>{classData.teacherName}</p>
            <p className="text-xs font-medium">Instructor</p>
          </div>
        </div>
        <div className="absolute bottom-5 right-4 md:bottom-3 md:right-3">
          <svg
            viewBox="0 0 64 64"
            className="w-24 -rotate-45 mix-blend-overlay"
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeMiterlimit={10}
              strokeWidth={2}
              d={illustrationArr[classData.illustrationIndex ?? 0]}
            />
          </svg>
        </div>
        <div
          className="absolute right-3 top-3 md:right-4 md:top-4"
          ref={wrapperRef}
        >
          <button onClick={handleToggleEllipsis}>
            <svg
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
            className={`${ellipsis ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute right-2 z-20 grid w-[10rem] gap-2 rounded-xl border border-border bg-card p-3 font-medium shadow-md transition-all ease-in-out`}
          >
            <button
              className="flex items-center gap-2 rounded-md text-[#f03e3e] transition-colors hover:text-[#c92a2a]"
              onClick={handleToggleShowConfirmation}
            >
              {type === "created" ? "Delete" : "Unenroll"}
            </button>
          </div>
        </div>
      </Link>
      {showConfirmation && (
        <ConfirmationModal
          type="delete"
          btnLabel={type === "created" ? "Delete" : "Unenroll"}
          isLoading={deleteClassIsPending}
          handleCancel={handleToggleShowConfirmation}
          handleAction={() => {
            onDeleteClass(
              "classId" in classData ? classData.classId : classData.id,
            );
            handleToggleShowConfirmation();
          }}
        >
          Are you sure you want to{" "}
          {type === "created" ? "delete" : "unenroll to"} this class?
        </ConfirmationModal>
      )}
    </li>
  );
}
