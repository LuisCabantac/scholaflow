"use client";

import Link from "next/link";
import Image from "next/image";
import { format, isThisYear, isToday, isYesterday } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ISession } from "@/lib/auth";
import { IStream } from "@/app/user/classroom/class/[classId]/page";
import { IClasswork } from "@/app/user/classroom/class/[classId]/classwork/page";
import noAssigned from "@/public/app/no_assigned.svg";
import noMissing from "@/public/app/no_missing.svg";
import noDone from "@/public/app/no_done.svg";

export default function ToDoSection({
  session,
  onGetAllClassworks,
  onGetAllEnrolledClassesClassworks,
}: {
  session: ISession;
  onGetAllClassworks: (userId: string) => Promise<IClasswork[] | null>;
  onGetAllEnrolledClassesClassworks: (
    userId: string,
  ) => Promise<IStream[] | null>;
}) {
  const searchParams = useSearchParams();

  const { data: enrolledClassworks } = useQuery({
    queryKey: ["enrolledClassesClassworks"],
    queryFn: () => onGetAllEnrolledClassesClassworks(session.user.id),
  });

  const { data: classworks } = useQuery({
    queryKey: ["classworks"],
    queryFn: () => onGetAllClassworks(session.user.id),
  });

  const assignedClassworks = enrolledClassworks
    ?.filter(
      (classwork) =>
        !classworks
          ?.map((turnedIn) => turnedIn.streamId)
          .includes(classwork.id) &&
        (classwork.hasDueDate === "false" ||
          (classwork.hasDueDate === "true" &&
            new Date(classwork?.dueDate ?? "") > new Date())) &&
        (classwork.announceToAll ||
          (classwork.announceTo &&
            classwork.announceTo.includes(session.user.id))) &&
        (classwork.scheduledAt
          ? new Date(classwork.scheduledAt) < new Date()
          : true),
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      return dateB.getTime() - dateA.getTime();
    });

  const missingClassworks = enrolledClassworks
    ?.filter(
      (classwork) =>
        !classworks?.some(
          (turnedIn) =>
            turnedIn.streamId === classwork.id && turnedIn.isTurnedIn,
        ) &&
        classwork.hasDueDate === "true" &&
        new Date(classwork?.dueDate ?? "") < new Date() &&
        (classwork.announceToAll ||
          (classwork.announceTo &&
            classwork.announceTo.includes(session.user.id))) &&
        (classwork.scheduledAt
          ? new Date(classwork.scheduledAt) < new Date()
          : true),
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      return dateB.getTime() - dateA.getTime();
    });

  const doneClassworks = classworks
    ?.filter(
      (classwork) =>
        (classwork.isTurnedIn || classwork.isGraded) &&
        enrolledClassworks
          ?.map((enrolledClasswork) => enrolledClasswork.classroomId)
          .includes(classwork.classroomId),
    )
    .sort((a, b) => {
      const dateA = new Date(a.turnedInDate);
      const dateB = new Date(b.turnedInDate);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <section className="flex flex-col items-start justify-start">
      <div className="flex items-start rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm md:text-base">
        <Link
          href="/user/to-do?sort=assigned"
          className={`px-3 py-2 transition-all ${searchParams.get("sort") === "assigned" || searchParams.get("sort") === null ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
        >
          Assigned
        </Link>
        <Link
          href="/user/to-do?sort=missing"
          className={`px-3 py-2 transition-all ${searchParams.get("sort") === "missing" ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
        >
          Missing
        </Link>
        <Link
          href="/user/to-do?sort=done"
          className={`px-3 py-2 transition-all ${searchParams.get("sort") === "done" ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
        >
          Done
        </Link>
      </div>
      <ul className="mt-2 grid w-full gap-2">
        {(searchParams.get("sort") === "assigned" ||
          searchParams.get("sort") === null) &&
        assignedClassworks?.length
          ? assignedClassworks.map((assignedClasswork) => {
              return (
                <li key={assignedClasswork.id}>
                  <Link
                    href={`/user/classroom/class/${assignedClasswork.classroomId}/stream/${assignedClasswork.id}`}
                    className="underline__container flex w-full items-center justify-between gap-2 rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] p-4 shadow-sm"
                  >
                    <div className="flex gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="mt-1 size-6 flex-shrink-0 stroke-[#5c7cfa]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                      <div>
                        <p className="underline__text font-medium">
                          {assignedClasswork.title}
                        </p>
                        <p>{assignedClasswork.classroomName}</p>
                        <div className="mt-2 grid gap-1 text-xs">
                          <p>
                            Posted{" "}
                            {isToday(assignedClasswork.created_at)
                              ? "today"
                              : isYesterday(assignedClasswork.created_at)
                                ? "yesterday"
                                : format(assignedClasswork.created_at, "MMM d")}
                          </p>
                          {assignedClasswork.dueDate &&
                          assignedClasswork.hasDueDate === "true" ? (
                            <p className="text-[#616572] md:hidden">
                              {isToday(assignedClasswork.dueDate)
                                ? `Due today, ${format(assignedClasswork.dueDate, "h:mm a")}`
                                : isYesterday(assignedClasswork.dueDate)
                                  ? `Due yesterday, ${format(assignedClasswork.dueDate, "h:mm a")}`
                                  : `Due ${format(assignedClasswork.dueDate, "MMM d,")} ${isThisYear(assignedClasswork.dueDate) ? "" : `${format(assignedClasswork.dueDate, "y ")}`} ${format(assignedClasswork.dueDate, "h:mm a")}`}
                            </p>
                          ) : (
                            <p className="text-[#616572] md:hidden">
                              No due date
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {assignedClasswork.dueDate &&
                    assignedClasswork.hasDueDate === "true" ? (
                      <p className="hidden text-[#616572] md:block">
                        {isToday(assignedClasswork.dueDate)
                          ? `Due today, ${format(assignedClasswork.dueDate, "h:mm a")}`
                          : isYesterday(assignedClasswork.dueDate)
                            ? `Due yesterday, ${format(assignedClasswork.dueDate, "h:mm a")}`
                            : `Due ${format(assignedClasswork.dueDate, "MMM d,")} ${isThisYear(assignedClasswork.dueDate) ? "" : `${format(assignedClasswork.dueDate, "y ")}`} ${format(assignedClasswork.dueDate, "h:mm a")}`}
                      </p>
                    ) : (
                      <p className="hidden text-[#616572] md:block">
                        No due date
                      </p>
                    )}
                  </Link>
                </li>
              );
            })
          : null}
        {searchParams.get("sort") === "missing" && missingClassworks?.length
          ? missingClassworks.map((missingClasswork) => {
              return (
                <li key={missingClasswork.id}>
                  <Link
                    href={`/user/classroom/class/${missingClasswork.classroomId}/stream/${missingClasswork.id}`}
                    className="underline__container flex w-full items-center justify-between gap-2 rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] p-4 shadow-sm"
                  >
                    <div className="flex gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="mt-1 size-6 flex-shrink-0 stroke-[#f03e3e]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                      <div>
                        <p className="underline__text font-medium">
                          {missingClasswork.title}
                        </p>
                        <p className="">{missingClasswork.classroomName}</p>
                        <div className="mt-2 grid gap-1 text-xs">
                          <p>
                            Posted{" "}
                            {isToday(missingClasswork.created_at)
                              ? "today"
                              : isYesterday(missingClasswork.created_at)
                                ? "yesterday"
                                : format(missingClasswork.created_at, "MMM d")}
                          </p>
                          {missingClasswork.dueDate &&
                            missingClasswork.hasDueDate === "true" && (
                              <p className="text-[#f03e3e] md:hidden">
                                {isToday(missingClasswork.dueDate)
                                  ? `Due today, ${format(missingClasswork.dueDate, "h:mm a")}`
                                  : isYesterday(missingClasswork.dueDate)
                                    ? `Due yesterday, ${format(missingClasswork.dueDate, "h:mm a")}`
                                    : `Due ${format(missingClasswork.dueDate, "MMM d,")} ${isThisYear(missingClasswork.dueDate) ? "" : `${format(missingClasswork.dueDate, "y ")}`} ${format(missingClasswork.dueDate, "h:mm a")}`}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                    {missingClasswork.dueDate &&
                      missingClasswork.hasDueDate === "true" && (
                        <p className="hidden text-[#f03e3e] md:block">
                          {isToday(missingClasswork.dueDate)
                            ? `Due today, ${format(missingClasswork.dueDate, "h:mm a")}`
                            : isYesterday(missingClasswork.dueDate)
                              ? `Due yesterday, ${format(missingClasswork.dueDate, "h:mm a")}`
                              : `Due ${format(missingClasswork.dueDate, "MMM d,")} ${isThisYear(missingClasswork.dueDate) ? "" : `${format(missingClasswork.dueDate, "y ")}`} ${format(missingClasswork.dueDate, "h:mm a")}`}
                        </p>
                      )}
                  </Link>
                </li>
              );
            })
          : null}
        {searchParams.get("sort") === "done" && doneClassworks?.length
          ? doneClassworks.map((doneClasswork) => (
              <li key={doneClasswork.id}>
                <Link
                  href={`/user/classroom/class/${doneClasswork.classroomId}/stream/${doneClasswork.streamId}`}
                  className="underline__container flex w-full items-center justify-between gap-2 rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] p-4 shadow-sm"
                >
                  <div className="flex gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="mt-1 size-6 flex-shrink-0 stroke-[#5c7cfa]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <div>
                      <p className="underline__text font-medium">
                        {doneClasswork.classworkTitle}
                      </p>
                      <p>{doneClasswork.classroomName}</p>
                      <div className="mt-2 grid gap-1 text-xs">
                        <p>
                          Posted{" "}
                          {isToday(doneClasswork.streamCreated)
                            ? "today"
                            : isYesterday(doneClasswork.streamCreated)
                              ? "yesterday"
                              : format(doneClasswork.streamCreated, "MMM d")}
                        </p>
                        <p className="md:hidden">
                          {doneClasswork.isGraded && doneClasswork.isTurnedIn
                            ? doneClasswork.userPoints
                            : doneClasswork.isTurnedIn
                              ? "Turned in"
                              : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="hidden md:block">
                    {doneClasswork.isGraded && doneClasswork.isTurnedIn
                      ? doneClasswork.userPoints
                      : doneClasswork.isTurnedIn
                        ? "Turned in"
                        : ""}
                  </p>
                </Link>
              </li>
            ))
          : null}
        {(searchParams.get("sort") === "assigned" ||
          searchParams.get("sort") === null) &&
        !assignedClassworks?.length ? (
          <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
            <div className="relative w-[15rem] md:w-[20rem]">
              <Image
                src={noAssigned}
                alt="no assigned classworks"
                className="object-cover"
              />
            </div>
            <p className="font-medium md:text-lg">
              No classworks have been given yet.
            </p>
          </div>
        ) : null}
        {searchParams.get("sort") === "missing" &&
        !missingClassworks?.length ? (
          <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
            <div className="relative w-[15rem] md:w-[20rem]">
              <Image
                src={noMissing}
                alt="no missing classworks"
                className="object-cover"
              />
            </div>
            <p className="font-medium md:text-lg">
              You&apos;re all caught up! No missing work.
            </p>
          </div>
        ) : null}
        {searchParams.get("sort") === "done" && !doneClassworks?.length ? (
          <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
            <div className="relative w-[15rem] md:w-[20rem]">
              <Image
                src={noDone}
                alt="no done classworks"
                className="object-cover"
              />
            </div>
            <p className="font-medium md:text-lg">No work submitted yet.</p>
          </div>
        ) : null}
      </ul>
    </section>
  );
}
