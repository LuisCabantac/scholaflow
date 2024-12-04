"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useClickOutside } from "@/contexts/ClickOutsideContext";

import { IClass } from "@/components/ClassroomSection";
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
  classData: IClass;
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
      className="relative flex h-[9rem] w-full flex-col gap-2 rounded-md text-[#F5F5F5] shadow-sm md:h-[10rem]"
      style={{
        backgroundColor: classData.classCardBackgroundColor,
      }}
    >
      <Link
        href={`/user/classroom/class/${classData.classroomId}`}
        className="relative h-[9rem] md:h-[10rem]"
      >
        <div className="absolute left-3 top-3 w-[88%] text-balance drop-shadow-sm md:left-4 md:top-4">
          <h5 className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold text-[#F5F5F5]">
            {classData.className}
          </h5>
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[#F5F5F5]">
            {classData.subject && `${classData.subject} · `}
            {classData.section}
          </p>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 text-balance drop-shadow-sm md:bottom-4 md:left-4">
          <Image
            src={classData.teacherAvatar}
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
            className={`${ellipsis ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute right-2 z-20 grid w-[10rem] gap-2 rounded-md bg-[#f3f6ff] p-3 font-medium shadow-md transition-all ease-in-out`}
          >
            <button
              className="flex items-center gap-2 rounded-md text-[#f03e3e] hover:text-[#c92a2a]"
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
              <span>{type === "created" ? "Delete" : "Unenroll"}</span>
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
            onDeleteClass(classData.classroomId);
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
