"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { isToday, format, isYesterday } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ISession } from "@/lib/auth";
import { joinClass } from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import { IStream } from "@/app/user/classroom/class/[classId]/page";
import { IClasswork } from "@/app/user/classroom/class/[classId]/classwork/page";

import Button from "@/components/Button";
import ClassroomLists from "@/components/ClassroomLists";
import CreateClassForm from "@/components/CreateClassForm";
import NoClasses from "@/components/NoClasses";
import JoinClassModal from "@/components/JoinClassModal";

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
  const [showCreateClassForm, setShowCreateClassForm] = useState(false);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [showAddClassPopover, setShowAddClassPopover] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [toDoFilter, setToDoFilter] = useState<"assigned" | "missing" | "done">(
    "assigned",
  );

  const { data: createdClasses, isPending: createdClassesIsPending } = useQuery(
    {
      queryKey: ["createdClasses"],
      queryFn: () => onGetAllClasses(session.user.id),
    },
  );

  const { data: enrolledClasses, isPending: enrolledClassesIsPending } =
    useQuery({
      queryKey: ["enrolledClasses"],
      queryFn: () => onGetAllEnrolledClasses(session.user.id),
    });

  const { data: enrolledClassworks } = useQuery({
    queryKey: ["enrolledClassesClassworks"],
    queryFn: () => onGetAllEnrolledClassesClassworks(session.user.id),
  });

  const { data: classworks } = useQuery({
    queryKey: ["classworks"],
    queryFn: () => onGetAllClassworks(session.user.id),
  });

  const { mutate: deleteClass, isPending: deleteClassIsPending } = useMutation({
    mutationFn: onDeleteClass,
    onSuccess: () => {
      toast.success("Class has been successfully removed.");
      router.refresh();

      queryClient.invalidateQueries({
        queryKey: ["createdClasses", "enrolledClasses"],
      });
    },
    onError: (error) => toast.error(error.message),
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

    if (classExists.teacherId === session.user.id || enrolledExists) {
      setIsLoading(false);
      toast.error("You're already in this class.");
      return;
    }

    const { success, message } = await joinClass(classExists.classroomId);
    if (success) {
      setIsLoading(false);
      toast.success(message);
      handleShowToggleJoinClass();
      router.push(`/user/classroom/class/${classExists.classroomId}`);
    } else toast.error(message);
  }

  function handleShowToggleAddClassPopover() {
    if (role === "teacher" || role === "student")
      setShowAddClassPopover(!showAddClassPopover);
  }

  function handleShowToggleJoinClass() {
    if (role === "teacher" || role === "student")
      setShowJoinClass(!showJoinClass);
  }

  function handleToggleShowCreateClassForm() {
    if (role === "teacher") setShowCreateClassForm(!showCreateClassForm);
    handleShowToggleAddClassPopover();
  }

  function handleShowToggleFilterDropdown() {
    if (role === "teacher" || role === "student")
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
    <div className="relative overflow-hidden">
      {!showCreateClassForm ? (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_18rem]">
          <div>
            <div className="flex items-center justify-between">
              <div
                className="relative flex cursor-pointer items-center justify-between gap-1 text-nowrap rounded-md md:gap-2"
                onClick={handleShowToggleFilterDropdown}
                ref={filterWrapperRef}
              >
                <div className="flex items-center gap-2 text-base font-medium md:gap-4 md:text-lg">
                  <span>
                    {searchParams.get("filter") === null
                      ? "All classes"
                      : `${searchParams.get("filter")?.charAt(0).toUpperCase()}${searchParams.get("filter")?.slice(1).split("-").join(" ")}`}
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
                      href="/user/classroom?filter=all-classes"
                      className={`${(searchParams.get("filter") === "all-classes" || searchParams.get("filter") === null) && "bg-[#c7d2f1] font-medium text-[#1a1c1f]"} block w-full text-nowrap rounded-md p-2 text-left hover:bg-[#d8e0f5]`}
                    >
                      All classes
                    </Link>
                  </li>

                  {role === "teacher" && (
                    <li>
                      <Link
                        href="/user/classroom?filter=created-classes"
                        className={`${searchParams.get("filter") === "created-classes" && "bg-[#c7d2f1] font-medium text-[#1a1c1f]"} block w-full text-nowrap rounded-md p-2 text-left hover:bg-[#d8e0f5]`}
                      >
                        Created classes
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/user/classroom?filter=enrolled-classes"
                      className={`${searchParams.get("filter") === "enrolled-classes" && "bg-[#c7d2f1] font-medium text-[#1a1c1f]"} block w-full text-nowrap rounded-md p-2 text-left hover:bg-[#d8e0f5]`}
                    >
                      Enrolled classes
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="relative" ref={btnWrapperRef}>
                {role === "teacher" ? (
                  <Button
                    type="primary"
                    onClick={handleShowToggleAddClassPopover}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    <span>Add class</span>
                  </Button>
                ) : (
                  <Button type="primary" onClick={handleShowToggleJoinClass}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    <span>Join class</span>
                  </Button>
                )}
                <div
                  className={`${showAddClassPopover ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute right-0 z-20 grid w-[10rem] gap-2 rounded-md bg-[#f3f6ff] p-2 shadow-md transition-all ease-in-out`}
                >
                  <button
                    className="flex items-center gap-2 rounded-md p-2 hover:bg-[#d8e0f5]"
                    onClick={handleShowToggleJoinClass}
                  >
                    Join class
                  </button>
                  {role === "teacher" && (
                    <button
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-[#d8e0f5]"
                      onClick={handleToggleShowCreateClassForm}
                    >
                      Create class
                    </button>
                  )}
                </div>
              </div>
            </div>

            {(createdClasses && createdClasses.length) ||
            (enrolledClasses && enrolledClasses.length) ? (
              <div className="mt-2 flex h-dvh w-full flex-col items-start gap-4 overflow-x-hidden overflow-y-scroll rounded-md md:grid md:grid-cols-2 md:gap-4">
                {(searchParams.get("filter") === "all-classes" ||
                  searchParams.get("filter") === "created-classes" ||
                  searchParams.get("filter") === null) && (
                  <ClassroomLists
                    classes={createdClasses}
                    classesIsPending={createdClassesIsPending}
                    handleDeleteClass={deleteClass}
                    deleteClassIsPending={deleteClassIsPending}
                  />
                )}
                {(searchParams.get("filter") === "all-classes" ||
                  searchParams.get("filter") === "enrolled-classes" ||
                  searchParams.get("filter") === null) && (
                  <ClassroomLists
                    classes={enrolledClasses}
                    classesIsPending={enrolledClassesIsPending}
                    handleDeleteClass={deleteClass}
                    deleteClassIsPending={deleteClassIsPending}
                  />
                )}
              </div>
            ) : (
              <NoClasses />
            )}
          </div>
          <div className="hidden overflow-hidden rounded-md border-2 border-[#dbe4ff] bg-[#f3f6ff] p-4 md:block">
            <h3 className="text-lg font-medium">To do</h3>
            <div className="mt-2 flex items-center justify-between rounded-md bg-[#dbe4ff] p-1 text-sm font-medium shadow-sm md:text-base">
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
            <ul className="mt-2 grid gap-2">
              {toDoFilter === "assigned" && enrolledClassworks?.length
                ? enrolledClassworks
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
                            classwork.announceTo.includes(session.user.id))),
                    )
                    .map((assignedClassworks) => {
                      return (
                        <li key={assignedClassworks.id}>
                          <Link
                            href={`/user/classroom/class/${assignedClassworks.classroomId}/stream/${assignedClassworks.id}`}
                            className="flex w-full items-center justify-between gap-2 rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] p-4 shadow-sm"
                          >
                            <div className="flex gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="mt-1 size-5 flex-shrink-0"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                />
                              </svg>
                              <div>
                                <p className="font-medium">
                                  {assignedClassworks.title}
                                </p>
                                <p className="text-sm">
                                  {assignedClassworks.classroomName}
                                </p>
                                <p className="mt-2 text-xs">
                                  Posted{" "}
                                  {isToday(assignedClassworks.created_at)
                                    ? "today"
                                    : isYesterday(assignedClassworks.created_at)
                                      ? "yesterday"
                                      : format(
                                          assignedClassworks.created_at,
                                          "MMM d",
                                        )}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })
                : null}
              {toDoFilter === "missing" && enrolledClassworks?.length
                ? enrolledClassworks
                    ?.filter(
                      (classwork) =>
                        !classworks?.some(
                          (turnedIn) =>
                            turnedIn.streamId === classwork.id &&
                            turnedIn.isTurnedIn,
                        ) &&
                        classwork.hasDueDate === "true" &&
                        new Date(classwork?.dueDate ?? "") < new Date() &&
                        (classwork.announceToAll ||
                          (classwork.announceTo &&
                            classwork.announceTo.includes(session.user.id))),
                    )
                    .map((assignedClassworks) => {
                      return (
                        <li key={assignedClassworks.id}>
                          <Link
                            href={`/user/classroom/class/${assignedClassworks.classroomId}/stream/${assignedClassworks.id}`}
                            className="flex w-full items-center justify-between gap-2 rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] p-4 shadow-sm"
                          >
                            <div className="flex gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="mt-1 size-5 flex-shrink-0"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                />
                              </svg>
                              <div>
                                <p className="font-medium">
                                  {assignedClassworks.title}
                                </p>
                                <p className="text-sm">
                                  {assignedClassworks.classroomName}
                                </p>
                                <p className="mt-2 text-xs">
                                  Posted{" "}
                                  {isToday(assignedClassworks.created_at)
                                    ? "today"
                                    : isYesterday(assignedClassworks.created_at)
                                      ? "yesterday"
                                      : format(
                                          assignedClassworks.created_at,
                                          "MMM d",
                                        )}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })
                : null}
              {toDoFilter === "done" && classworks?.length
                ? classworks
                    ?.filter((classwork) => classwork.isTurnedIn)
                    .map((work) => (
                      <li key={work.id}>
                        <Link
                          href={`/user/classroom/class/${work.classroomId}/stream/${work.streamId}`}
                          className="flex w-full items-center justify-between gap-2 rounded-md border-2 border-[#dbe4ff] bg-[#f5f8ff] p-4 shadow-sm"
                        >
                          <div className="flex gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="mt-1 size-5 flex-shrink-0"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                              />
                            </svg>
                            <div>
                              <p className="font-medium">
                                {work.classworkTitle}
                              </p>
                              <p className="text-sm">{work.classroomName}</p>
                              <p className="mt-2 text-xs">
                                Posted{" "}
                                {isToday(work.streamCreated)
                                  ? "today"
                                  : isYesterday(work.streamCreated)
                                    ? "yesterday"
                                    : format(work.streamCreated, "MMM d")}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="whitespace-nowrap text-sm">
                              {work.isGraded && work.isTurnedIn
                                ? `${work.userPoints}`
                                : work.isTurnedIn
                                  ? "Turned in"
                                  : ""}
                            </p>
                          </div>
                        </Link>
                      </li>
                    ))
                : null}
              {toDoFilter === "assigned" &&
              !enrolledClassworks?.filter(
                (classwork) =>
                  !classworks
                    ?.map((turnedIn) => turnedIn.streamId)
                    .includes(classwork.id) &&
                  (classwork.hasDueDate === "false" ||
                    (classwork.hasDueDate === "true" &&
                      new Date(classwork?.dueDate ?? "") > new Date())) &&
                  (classwork.announceToAll ||
                    (classwork.announceTo &&
                      classwork.announceTo.includes(session.user.id))),
              ).length ? (
                <p className="flex h-[10rem] items-center justify-center text-center text-sm font-medium">
                  No classworks have been given yet.
                </p>
              ) : null}
              {toDoFilter === "missing" &&
              !enrolledClassworks?.filter(
                (classwork) =>
                  !classworks?.some(
                    (turnedIn) =>
                      turnedIn.streamId === classwork.id && turnedIn.isTurnedIn,
                  ) &&
                  classwork.hasDueDate === "true" &&
                  new Date(classwork?.dueDate ?? "") < new Date() &&
                  (classwork.announceToAll ||
                    (classwork.announceTo &&
                      classwork.announceTo.includes(session.user.id))),
              ).length ? (
                <p className="flex h-[10rem] items-center justify-center text-center text-sm font-medium">
                  You&apos;re all caught up! No missing work.
                </p>
              ) : null}
              {toDoFilter === "done" &&
              !classworks?.filter((classwork) => classwork.isTurnedIn)
                .length ? (
                <p className="flex h-[10rem] items-center justify-center text-center text-sm font-medium">
                  No work submitted yet.
                </p>
              ) : null}
            </ul>
          </div>
        </div>
      ) : (
        <CreateClassForm
          session={session}
          onShowCreateClassForm={handleToggleShowCreateClassForm}
        />
      )}
      {showJoinClass && (
        <JoinClassModal
          isLoading={isLoading}
          onJoinClass={handleJoinClass}
          onShowJoinClass={handleShowToggleJoinClass}
          setShowJoinClass={setShowJoinClass}
        />
      )}
    </div>
  );
}
