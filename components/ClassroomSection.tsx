"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { isToday, format, isYesterday, isThisYear } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ISession } from "@/lib/auth";
import { joinClass } from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import { IStream } from "@/app/user/classroom/class/[classId]/page";
import { IClasswork } from "@/app/user/classroom/class/[classId]/classwork/page";

import Button from "@/components/Button";
import ClassroomLists from "@/components/ClassroomLists";
import ClassForm from "@/components/ClassForm";
import JoinClassDialog from "@/components/JoinClassDialog";
import NoClasses from "@/components/NoClasses";

export interface IClass {
  id: string;
  classroomId: string;
  className: string;
  teacherName: string;
  teacherAvatar: string;
  userName: string;
  userAvatar: string;
  userId: string;
  subject: string;
  section: string;
  teacherId: string;
  room: string;
  classCode: string;
  created_at: string;
  classCardBackgroundColor: string;
  illustrationIndex: number;
  allowStudentsToPost: boolean;
  allowStudentsToComment: boolean;
  classDescription: string;
}

export default function ClassroomSection({
  role,
  session,
  onGetClass,
  onDeleteClass,
  onGetAllClasses,
  onGetAllClassworks,
  onGetEnrolledClass,
  onGetAllEnrolledClasses,
  onGetAllEnrolledClassesClassworks,
}: {
  role: string;
  session: ISession;
  onGetClass: (code: string) => Promise<IClass | null>;
  onDeleteClass: (classId: string) => Promise<void>;
  onGetAllClasses: (id: string) => Promise<IClass[] | null>;
  onGetEnrolledClass: (classId: string) => Promise<IClass | null>;
  onGetAllClassworks: (userId: string) => Promise<IClasswork[] | null>;
  onGetAllEnrolledClasses: (id: string) => Promise<IClass[] | null>;
  onGetAllEnrolledClassesClassworks: (
    userId: string,
  ) => Promise<IStream[] | null>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const btnWrapperRef = useRef<HTMLDivElement>(null);
  const filterWrapperRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [showAddClassPopover, setShowAddClassPopover] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [toDoFilter, setToDoFilter] = useState<"assigned" | "missing" | "done">(
    "assigned",
  );

  const { data: createdClasses, isPending: createdClassesIsPending } = useQuery(
    {
      queryKey: [`createdClasses--${session.id}`],
      queryFn: () => onGetAllClasses(session.id),
    },
  );

  const { data: enrolledClasses, isPending: enrolledClassesIsPending } =
    useQuery({
      queryKey: [`enrolledClasses--${session.id}`],
      queryFn: () => onGetAllEnrolledClasses(session.id),
    });

  const { data: enrolledClassworks } = useQuery({
    queryKey: [`enrolledClassesClassworks--${session.id}`],
    queryFn: () => onGetAllEnrolledClassesClassworks(session.id),
  });

  const { data: classworks } = useQuery({
    queryKey: [`classworks--${session.id}`],
    queryFn: () => onGetAllClassworks(session.id),
  });

  const { mutate: deleteClass, isPending: deleteClassIsPending } = useMutation({
    mutationFn: onDeleteClass,
    onSuccess: () => {
      toast.success("Class has been successfully removed.");

      queryClient.invalidateQueries({
        queryKey: [
          `createdClasses--${session.id}`,
          `enrolledClasses--${session.id}`,
        ],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
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
        enrolledClasses
          ?.map((enrolledClass) => enrolledClass.classroomId)
          .includes(classwork.classroomId),
    )
    .sort((a, b) => {
      const dateA = new Date(a.turnedInDate);
      const dateB = new Date(b.turnedInDate);
      dateA.setHours(0, 0, 0, 0);
      dateB.setHours(0, 0, 0, 0);
      return dateB.getTime() - dateA.getTime();
    });

  async function handleJoinClass(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const code = formData.get("classCode") as string;

    const classExists = await onGetClass(code);
    if (!classExists) {
      setIsLoading(false);
      toast.error("Class not found");
      return;
    }

    const enrolledExists = await onGetEnrolledClass(classExists.classroomId);

    if (classExists.teacherId === session.id || enrolledExists) {
      setIsLoading(false);
      toast.error("You're already in this class.");
      return;
    }

    const { success, message } = await joinClass(classExists.classroomId);
    if (success) {
      setIsLoading(false);
      toast.success(message);
      handleToggleShowJoinClass();
      router.push(`/user/classroom/class/${classExists.classroomId}`);
    } else toast.error(message);
  }

  function handleToggleShowAddClassPopover() {
    setShowAddClassPopover(!showAddClassPopover);
  }

  function handleToggleShowJoinClass() {
    setShowJoinClass(!showJoinClass);
  }

  function handleToggleShowClassForm() {
    if (role === "teacher") setShowClassForm(!showClassForm);
    handleToggleShowAddClassPopover();
  }

  function handleToggleShowFilterDropdown() {
    setShowFilterDropdown(!showFilterDropdown);
  }

  useClickOutsideHandler(
    btnWrapperRef,
    () => {
      setShowAddClassPopover(false);
    },
    false,
  );

  useClickOutsideHandler(
    filterWrapperRef,
    () => {
      setShowFilterDropdown(false);
    },
    false,
  );

  return (
    <section className="relative overflow-hidden">
      <div className="grid items-start gap-4 md:grid-cols-[1fr_18rem]">
        <div>
          <div className="flex items-center justify-between">
            <div
              className="relative flex cursor-pointer items-center justify-between gap-1 text-nowrap rounded-md md:gap-2"
              onClick={handleToggleShowFilterDropdown}
              ref={filterWrapperRef}
            >
              <div className="flex items-center gap-2 text-base font-medium md:gap-4">
                <span>
                  {searchParams.get("sort") === null
                    ? "All classes"
                    : `${searchParams.get("sort")?.charAt(0).toUpperCase()}${searchParams.get("sort")?.slice(1).split("-").join(" ")}`}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className={`${showFilterDropdown ? "rotate-180" : "rotate-0"} size-4 transition-transform`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
              <ul
                className={`${showFilterDropdown ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute left-0 z-20 grid justify-start gap-2 rounded-md bg-[#f3f6ff] p-2 shadow-md transition-all ease-in-out`}
              >
                <li>
                  <Link
                    href="/user/classroom?sort=all-classes"
                    className={`${(searchParams.get("sort") === "all-classes" || searchParams.get("sort") === null) && "font-medium"} flex w-full items-center justify-between gap-2 text-nowrap rounded-md p-2 text-left hover:bg-[#d8e0f5]`}
                  >
                    <span>All classes</span>
                    {(searchParams.get("sort") === "all-classes" ||
                      searchParams.get("sort") === null) && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </Link>
                </li>
                {role === "teacher" && (
                  <li>
                    <Link
                      href="/user/classroom?sort=created-classes"
                      className={`${searchParams.get("sort") === "created-classes" && "font-medium"} flex w-full items-center justify-between gap-2 text-nowrap rounded-md p-2 text-left hover:bg-[#d8e0f5]`}
                    >
                      <span>Created classes</span>
                      {searchParams.get("sort") === "created-classes" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                          stroke="currentColor"
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      )}
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/user/classroom?sort=enrolled-classes"
                    className={`${searchParams.get("sort") === "enrolled-classes" && "font-medium"} flex w-full items-center justify-between gap-2 text-nowrap rounded-md p-2 text-left hover:bg-[#d8e0f5]`}
                  >
                    <span>Enrolled classes</span>
                    {searchParams.get("sort") === "enrolled-classes" && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="relative" ref={btnWrapperRef}>
              <Button
                type="primary"
                onClick={
                  role === "teacher"
                    ? handleToggleShowAddClassPopover
                    : handleToggleShowJoinClass
                }
              >
                Add class
              </Button>
              <div
                className={`${showAddClassPopover ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute right-0 z-20 grid w-[10rem] rounded-md bg-[#f3f6ff] p-2 font-medium shadow-md transition-all ease-in-out`}
              >
                <button
                  className="flex items-center rounded-md p-2 hover:text-[#242628]"
                  onClick={handleToggleShowJoinClass}
                >
                  Join class
                </button>
                {role === "teacher" && (
                  <button
                    className="flex items-center rounded-md p-2 hover:text-[#242628]"
                    onClick={handleToggleShowClassForm}
                  >
                    Create class
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-around rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:hidden">
            <Link href="/user/to-do?filter=assigned">
              <p className="text-2xl font-semibold">
                {assignedClassworks?.length ?? 0}
              </p>
              <h4 className="text-xs font-medium text-[#616572]">Assigned</h4>
            </Link>
            <div className="mx-4 h-8 w-px bg-[#dddfe6]"></div>
            <Link href="/user/to-do?filter=missing">
              <p className="text-2xl font-semibold">
                {missingClassworks?.length ?? 0}
              </p>
              <h4 className="text-xs font-medium text-[#616572]">Missing</h4>
            </Link>
            <div className="mx-4 h-8 w-px bg-[#dddfe6]"></div>
            <Link href="/user/to-do?filter=done">
              <p className="text-2xl font-semibold">
                {doneClassworks?.length ?? 0}
              </p>
              <h4 className="text-xs font-medium text-[#616572]">Done</h4>
            </Link>
          </div>
          {(!createdClasses?.length &&
            !enrolledClasses?.length &&
            !createdClassesIsPending &&
            !enrolledClassesIsPending) ||
          (searchParams.get("sort") === "created-classes" &&
            !createdClasses?.length &&
            !createdClassesIsPending) ||
          (searchParams.get("sort") === "enrolled-classes" &&
            !enrolledClasses?.length &&
            !enrolledClassesIsPending) ? (
            <NoClasses />
          ) : (
            <div className="mt-2 flex w-full flex-col items-start gap-2 rounded-md md:grid md:grid-cols-2">
              {(searchParams.get("sort") === "all-classes" ||
                searchParams.get("sort") === "created-classes" ||
                searchParams.get("sort") === null) && (
                <ClassroomLists
                  type="created"
                  classes={createdClasses}
                  classesIsPending={createdClassesIsPending}
                  handleDeleteClass={deleteClass}
                  deleteClassIsPending={deleteClassIsPending}
                />
              )}
              {(searchParams.get("sort") === "all-classes" ||
                searchParams.get("sort") === "enrolled-classes" ||
                searchParams.get("sort") === null) && (
                <ClassroomLists
                  type="enrolled"
                  classes={enrolledClasses}
                  classesIsPending={enrolledClassesIsPending}
                  handleDeleteClass={deleteClass}
                  deleteClassIsPending={deleteClassIsPending}
                />
              )}
            </div>
          )}
        </div>
        <div className="hidden overflow-hidden rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-4 md:block">
          <h3 className="text-lg font-medium tracking-tight">To-do</h3>
          <div className="mt-2 flex items-center justify-between rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
            <button
              onClick={() => setToDoFilter("assigned")}
              className={`px-3 py-2 transition-all ${toDoFilter === "assigned" ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
            >
              Assigned
            </button>
            <button
              onClick={() => setToDoFilter("missing")}
              className={`px-3 py-2 transition-all ${toDoFilter === "missing" ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
            >
              Missing
            </button>
            <button
              onClick={() => setToDoFilter("done")}
              className={`px-3 py-2 transition-all ${toDoFilter === "done" ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
            >
              Done
            </button>
          </div>
          <ul className="mt-2 grid w-full gap-2">
            {toDoFilter === "assigned" && assignedClassworks?.length
              ? assignedClassworks.map((assignedClasswork) => {
                  return (
                    <li key={assignedClasswork.id}>
                      <Link
                        href={`/user/classroom/class/${assignedClasswork.classroomId}/stream/${assignedClasswork.id}`}
                        className="underline__container flex w-full items-center justify-between gap-2 rounded-md border border-[#dddfe6] bg-[#f5f8ff] p-4 shadow-sm"
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
                            <p className="text-xs">
                              {assignedClasswork.classroomName}
                            </p>
                            <div className="mt-2 grid items-center gap-1 text-xs">
                              <p>
                                Posted{" "}
                                {isToday(assignedClasswork.created_at)
                                  ? "today"
                                  : isYesterday(assignedClasswork.created_at)
                                    ? "yesterday"
                                    : format(
                                        assignedClasswork.created_at,
                                        "MMM d",
                                      )}
                              </p>
                              {assignedClasswork.dueDate ? (
                                <p className="text-xs text-[#616572]">
                                  {isToday(assignedClasswork.dueDate)
                                    ? `Due today, ${format(assignedClasswork.dueDate, "h:mm a")}`
                                    : isYesterday(assignedClasswork.dueDate)
                                      ? `Due yesterday, ${format(assignedClasswork.dueDate, "h:mm a")}`
                                      : `Due ${format(assignedClasswork.dueDate, "MMM d,")} ${isThisYear(assignedClasswork.dueDate) ? "" : `${format(assignedClasswork.dueDate, "y ")}`} ${format(assignedClasswork.dueDate, "h:mm a")}`}
                                </p>
                              ) : (
                                <p className="text-xs text-[#616572]">
                                  No due date
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })
              : null}
            {toDoFilter === "missing" && missingClassworks?.length
              ? missingClassworks.map((missingClasswork) => {
                  return (
                    <li key={missingClasswork.id}>
                      <Link
                        href={`/user/classroom/class/${missingClasswork.classroomId}/stream/${missingClasswork.id}`}
                        className="underline__container flex w-full items-center justify-between gap-2 rounded-md border border-[#dddfe6] bg-[#f5f8ff] p-4 shadow-sm"
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
                              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                            />
                          </svg>
                          <div>
                            <p className="underline__text font-medium">
                              {missingClasswork.title}
                            </p>
                            <p className="text-xs">
                              {missingClasswork.classroomName}
                            </p>
                            <div className="mt-2 grid items-center gap-1 text-xs">
                              <p>
                                Posted{" "}
                                {isToday(missingClasswork.created_at)
                                  ? "today"
                                  : isYesterday(missingClasswork.created_at)
                                    ? "yesterday"
                                    : format(
                                        missingClasswork.created_at,
                                        "MMM d",
                                      )}
                              </p>
                              {missingClasswork.dueDate && (
                                <p className="text-xs text-[#f03e3e]">
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
                      </Link>
                    </li>
                  );
                })
              : null}
            {toDoFilter === "done" && doneClassworks?.length
              ? doneClassworks.map((doneClasswork) => (
                  <li key={doneClasswork.id}>
                    <Link
                      href={`/user/classroom/class/${doneClasswork.classroomId}/stream/${doneClasswork.streamId}`}
                      className="underline__container flex w-full items-center justify-between gap-2 rounded-md border border-[#dddfe6] bg-[#f5f8ff] p-4 shadow-sm"
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
                          <p className="text-xs">
                            {doneClasswork.classroomName}
                          </p>
                          <div className="mt-2 grid items-center gap-1 text-xs">
                            <p>
                              Posted{" "}
                              {isToday(doneClasswork.streamCreated)
                                ? "today"
                                : isYesterday(doneClasswork.streamCreated)
                                  ? "yesterday"
                                  : format(
                                      doneClasswork.streamCreated,
                                      "MMM d",
                                    )}
                            </p>
                            <p className="whitespace-nowrap">
                              {doneClasswork.isGraded &&
                              doneClasswork.isTurnedIn
                                ? `Score: ${doneClasswork.userPoints}`
                                : doneClasswork.isTurnedIn
                                  ? "Turned in"
                                  : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div></div>
                    </Link>
                  </li>
                ))
              : null}
            {toDoFilter === "assigned" && !assignedClassworks?.length ? (
              <p className="flex h-[10rem] items-center justify-center text-center font-medium">
                No classworks have been given yet.
              </p>
            ) : null}
            {toDoFilter === "missing" && !missingClassworks?.length ? (
              <p className="flex h-[10rem] items-center justify-center text-center font-medium">
                You&apos;re all caught up! No missing work.
              </p>
            ) : null}
            {toDoFilter === "done" && !doneClassworks?.length ? (
              <p className="flex h-[10rem] items-center justify-center text-center font-medium">
                No work submitted yet.
              </p>
            ) : null}
          </ul>
        </div>
      </div>
      {showClassForm && (
        <ClassForm
          type="create"
          session={session}
          onDeleteClass={onDeleteClass}
          onSetShowClassForm={setShowClassForm}
          onToggleShowClassForm={handleToggleShowClassForm}
        />
      )}
      {showJoinClass && (
        <JoinClassDialog
          isLoading={isLoading}
          onJoinClass={handleJoinClass}
          onShowJoinClass={handleToggleShowJoinClass}
          setShowJoinClass={setShowJoinClass}
        />
      )}
    </section>
  );
}
