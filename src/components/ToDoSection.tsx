"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { format, isThisYear, isToday, isYesterday } from "date-fns";

import { Classwork, Session, Stream } from "@/lib/schema";

import noAssigned from "@/public/app/no_assigned.svg";
import noMissing from "@/public/app/no_missing.svg";
import noDone from "@/public/app/no_done.svg";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ToDoSection({
  session,
  onGetAllClassworks,
  onGetAllEnrolledClassesClassworks,
}: {
  session: Session;
  onGetAllClassworks: (userId: string) => Promise<Classwork[] | null>;
  onGetAllEnrolledClassesClassworks: (
    userId: string,
  ) => Promise<Stream[] | null>;
}) {
  const searchParams = useSearchParams();

  const { data: enrolledClassworks } = useQuery({
    queryKey: [`enrolledClassesClassworks--${session.id}`],
    queryFn: () => onGetAllEnrolledClassesClassworks(session.id),
  });

  const { data: classworks } = useQuery({
    queryKey: [`classworks--${session.id}`],
    queryFn: () => onGetAllClassworks(session.id),
  });

  const assignedClassworks = enrolledClassworks
    ?.filter(
      (classwork) =>
        !classworks
          ?.map((turnedIn) => turnedIn.streamId)
          .includes(classwork.id) &&
        (!classwork.dueDate ||
          (classwork.dueDate &&
            new Date(classwork.dueDate ?? "") > new Date())) &&
        (classwork.announceToAll ||
          (classwork.announceTo &&
            classwork.announceTo.includes(session.id))) &&
        (classwork.scheduledAt
          ? new Date(classwork.scheduledAt) < new Date()
          : true),
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
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
        classwork.dueDate &&
        new Date(classwork.dueDate ?? "") < new Date() &&
        (classwork.announceToAll ||
          (classwork.announceTo &&
            classwork.announceTo.includes(session.id))) &&
        (classwork.scheduledAt
          ? new Date(classwork.scheduledAt) < new Date()
          : true),
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      return dateB.getTime() - dateA.getTime();
    });

  const doneClassworks = classworks
    ?.filter(
      (classwork) =>
        (classwork.isTurnedIn || classwork.isGraded) &&
        enrolledClassworks
          ?.map((enrolledClasswork) => enrolledClasswork.classId)
          .includes(classwork.classId),
    )
    .sort((a, b) => {
      const dateA = new Date(a.turnedInDate ?? 0);
      const dateB = new Date(b.turnedInDate ?? 0);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      return dateB.getTime() - dateA.getTime();
    });

  return (
    <section className="flex flex-col items-start justify-start">
      <Tabs
        defaultValue="assigned"
        value={
          searchParams.get("sort") === "assigned" ||
          searchParams.get("sort") === null
            ? "assigned"
            : searchParams.get("sort") === "missing"
              ? "missing"
              : "done"
        }
      >
        <TabsList>
          <TabsTrigger value="assigned" asChild>
            <Link href="/to-do?sort=assigned">Assigned</Link>
          </TabsTrigger>
          <TabsTrigger value="missing" asChild>
            <Link href="/to-do?sort=missing">Missing</Link>
          </TabsTrigger>
          <TabsTrigger value="done" asChild>
            <Link href="/to-do?sort=done">Done</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <ul className="mt-2 grid w-full gap-2">
        {(searchParams.get("sort") === "assigned" ||
          searchParams.get("sort") === null) &&
        assignedClassworks?.length
          ? assignedClassworks.map((assignedClasswork) => {
              return (
                <li key={assignedClasswork.id}>
                  <Link
                    href={`/classroom/class/${assignedClasswork.classId}/stream/${assignedClasswork.id}`}
                    className="group flex w-full items-center justify-between gap-2 rounded-md border bg-card p-3 shadow-sm md:p-4"
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
                        <p className="font-medium text-foreground group-hover:underline">
                          {assignedClasswork.title}
                        </p>
                        <p className="text-foreground/70">
                          {assignedClasswork.className}
                        </p>
                        <div className="mt-2 grid gap-1 text-xs text-foreground/70">
                          <p>
                            Posted{" "}
                            {isToday(assignedClasswork.createdAt)
                              ? "today"
                              : isYesterday(assignedClasswork.createdAt)
                                ? "yesterday"
                                : format(assignedClasswork.createdAt, "MMM d")}
                          </p>
                          {assignedClasswork.dueDate ? (
                            <p className="text-foreground md:hidden">
                              {isToday(assignedClasswork.dueDate)
                                ? `Due today, ${format(assignedClasswork.dueDate, "h:mm a")}`
                                : isYesterday(assignedClasswork.dueDate)
                                  ? `Due yesterday, ${format(assignedClasswork.dueDate, "h:mm a")}`
                                  : `Due ${format(assignedClasswork.dueDate, "MMM d,")} ${isThisYear(assignedClasswork.dueDate) ? "" : `${format(assignedClasswork.dueDate, "y ")}`} ${format(assignedClasswork.dueDate, "h:mm a")}`}
                            </p>
                          ) : (
                            <p className="text-foreground md:hidden">
                              No due date
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {assignedClasswork.dueDate ? (
                      <p className="hidden text-foreground/70 md:block">
                        {isToday(assignedClasswork.dueDate)
                          ? `Due today, ${format(assignedClasswork.dueDate, "h:mm a")}`
                          : isYesterday(assignedClasswork.dueDate)
                            ? `Due yesterday, ${format(assignedClasswork.dueDate, "h:mm a")}`
                            : `Due ${format(assignedClasswork.dueDate, "MMM d,")} ${isThisYear(assignedClasswork.dueDate) ? "" : `${format(assignedClasswork.dueDate, "y ")}`} ${format(assignedClasswork.dueDate, "h:mm a")}`}
                      </p>
                    ) : (
                      <p className="hidden text-foreground/70 md:block">
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
                    href={`/classroom/class/${missingClasswork.classId}/stream/${missingClasswork.id}`}
                    className="group flex w-full items-center justify-between gap-2 rounded-md border bg-card p-3 shadow-sm md:p-4"
                  >
                    <div className="flex gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="mt-1 size-6 flex-shrink-0 stroke-destructive"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-foreground group-hover:underline">
                          {missingClasswork.title}
                        </p>
                        <p className="text-foreground/70">
                          {missingClasswork.className}
                        </p>
                        <div className="mt-2 grid gap-1 text-xs">
                          <p className="text-foreground/70">
                            Posted{" "}
                            {isToday(missingClasswork.createdAt)
                              ? "today"
                              : isYesterday(missingClasswork.createdAt)
                                ? "yesterday"
                                : format(missingClasswork.createdAt, "MMM d")}
                          </p>
                          {missingClasswork.dueDate && (
                            <p className="text-destructive md:hidden">
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
                    {missingClasswork.dueDate && (
                      <p className="hidden text-destructive md:block">
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
                  href={`/classroom/class/${doneClasswork.classId}/stream/${doneClasswork.streamId}`}
                  className="group flex w-full items-center justify-between gap-2 rounded-md border bg-card p-3 shadow-sm md:p-4"
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
                      <p className="font-medium text-foreground group-hover:underline">
                        {doneClasswork.title}
                      </p>
                      <p className="text-foreground/70">
                        {doneClasswork.className}
                      </p>
                      <div className="mt-2 grid gap-1 text-xs text-foreground/70">
                        <p>
                          Posted{" "}
                          {isToday(doneClasswork.streamCreatedAt)
                            ? "today"
                            : isYesterday(doneClasswork.streamCreatedAt)
                              ? "yesterday"
                              : format(doneClasswork.streamCreatedAt, "MMM d")}
                        </p>
                        <p className="md:hidden">
                          {doneClasswork.isGraded && doneClasswork.isTurnedIn
                            ? doneClasswork.points
                            : doneClasswork.isTurnedIn
                              ? "Turned in"
                              : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="hidden text-foreground/70 md:block">
                    {doneClasswork.isGraded && doneClasswork.isTurnedIn
                      ? doneClasswork.points
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
