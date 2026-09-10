"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isToday, format, isYesterday, isThisYear } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ClipboardList,
  PlusIcon,
} from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { joinClass } from "@/lib/classroom-actions";
import { useClickOutside } from "@/contexts/ClickOutsideContext";
import {
  Classroom,
  Classwork,
  EnrolledClass,
  Session,
  Stream,
} from "@/lib/schema";

import NoClasses from "@/components/NoClasses";
import ClassForm from "@/components/ClassForm";
import { Button } from "@/components/ui/button";
import ClassroomLists from "@/components/ClassroomLists";
import JoinClassDialog from "@/components/JoinClassDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function ClassroomSection({
  session,
  onGetClass,
  onDeleteClass,
  onGetAllClasses,
  onGetAllClassworks,
  onGetEnrolledClass,
  onGetAllEnrolledClasses,
  onGetAllEnrolledClassesClassworks,
}: {
  session: Session;
  onGetClass: (code: string) => Promise<Classroom | null>;
  onDeleteClass: (classId: string) => Promise<void>;
  onGetAllClasses: (id: string) => Promise<Classroom[] | null>;
  onGetEnrolledClass: (classId: string) => Promise<EnrolledClass | null>;
  onGetAllClassworks: (userId: string) => Promise<Classwork[] | null>;
  onGetAllEnrolledClasses: (id: string) => Promise<EnrolledClass[] | null>;
  onGetAllEnrolledClassesClassworks: (
    userId: string,
  ) => Promise<Stream[] | null>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { useClickOutsideHandler } = useClickOutside();
  const btnWrapperRef = useRef<HTMLDivElement>(null);
  const filterWrapperRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [fabIsOpen, setFabIsOpen] = useState(false);
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
        queryKey: [`createdClasses--${session.id}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`enrolledClasses--${session.id}`],
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
        enrolledClasses
          ?.map((enrolledClass) => enrolledClass.classId)
          .includes(classwork.classId),
    )
    .sort((a, b) => {
      const dateA = new Date(a.turnedInDate ?? 0);
      const dateB = new Date(b.turnedInDate ?? 0);
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

    const enrolledExists = await onGetEnrolledClass(classExists.id);

    if (classExists.teacherId === session.id || enrolledExists) {
      setIsLoading(false);
      toast.error("You're already in this class.");
      return;
    }

    const { success, message } = await joinClass(classExists.id);
    if (success) {
      setIsLoading(false);
      toast.success(message);

      queryClient.invalidateQueries({
        queryKey: [`createdClasses--${session.id}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`enrolledClasses--${session.id}`],
      });

      handleToggleShowJoinClass();
      router.push(`/classroom/class/${classExists.id}`);
    } else toast.error(message);
  }

  function handleToggleShowAddClassPopover() {
    setShowAddClassPopover(!showAddClassPopover);
  }

  function handleToggleShowFab() {
    setFabIsOpen((prev) => !prev);
  }

  function handleToggleShowJoinClass() {
    setShowJoinClass(!showJoinClass);
  }

  function handleToggleShowClassForm() {
    setShowClassForm(!showClassForm);
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
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-auto p-0 hover:bg-transparent"
                  onClick={handleToggleShowFilterDropdown}
                >
                  <span className="text-base">
                    {searchParams.get("sort") === null
                      ? "All classes"
                      : `${searchParams.get("sort")?.charAt(0).toUpperCase()}${searchParams.get("sort")?.slice(1).split("-").join(" ")}`}
                  </span>
                  <ChevronDown
                    strokeWidth={3}
                    className={`${showFilterDropdown ? "rotate-180" : "rotate-0"} h-4 w-4 transition-transform`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link
                    href="/classroom?sort=all-classes"
                    className={`${searchParams.get("sort") === "all-classes" || searchParams.get("sort") === null ? "font-medium" : "text-foreground/70"} flex w-full cursor-pointer items-center justify-between gap-2 text-nowrap rounded-xl p-2 text-left`}
                  >
                    <span>All classes</span>
                    {(searchParams.get("sort") === "all-classes" ||
                      searchParams.get("sort") === null) && (
                      <Check strokeWidth={3} className="h-4 w-4" />
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/classroom?sort=created-classes"
                    className={`${searchParams.get("sort") === "created-classes" ? "font-medium" : "text-foreground/70"} flex w-full cursor-pointer items-center justify-between gap-2 text-nowrap rounded-xl p-2 text-left`}
                  >
                    <span>Created classes</span>
                    {searchParams.get("sort") === "created-classes" && (
                      <Check strokeWidth={3} className="h-4 w-4" />
                    )}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/classroom?sort=enrolled-classes"
                    className={`${searchParams.get("sort") === "enrolled-classes" ? "font-medium" : "text-foreground/70"} flex w-full cursor-pointer items-center justify-between gap-2 text-nowrap rounded-xl p-2 text-left`}
                  >
                    <span>Enrolled classes</span>
                    {searchParams.get("sort") === "enrolled-classes" && (
                      <Check strokeWidth={3} className="h-4 w-4" />
                    )}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden md:flex" asChild>
                <Button>
                  <PlusIcon className="h-12 w-12" />
                  Add class
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="hidden md:block">
                <DropdownMenuItem asChild>
                  <button
                    onClick={handleToggleShowJoinClass}
                    className="w-full text-start"
                  >
                    Join class
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    onClick={handleToggleShowClassForm}
                    className="w-full text-start"
                  >
                    Create class
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Card className="mt-2 md:hidden">
            <CardContent className="flex items-center justify-between p-4">
              <Link
                href="/to-do?filter=assigned"
                className="flex items-center gap-2"
              >
                <ClipboardList className="h-12 w-12" strokeWidth={1.3} />
                <div>
                  <span className="text-[0.65rem] text-foreground/70">
                    Assigned
                  </span>
                  <p className="text-3xl font-semibold">
                    {assignedClassworks?.length ?? 0}
                  </p>
                </div>
              </Link>
              <Link
                href="/to-do?filter=missing"
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-12 w-12" strokeWidth={1.3} />
                <div>
                  <span className="text-[0.65rem] text-foreground/70">
                    Missing
                  </span>
                  <p className="text-3xl font-semibold">
                    {missingClassworks?.length ?? 0}
                  </p>
                </div>
              </Link>
              <Link
                href="/to-do?filter=done"
                className="mr-2 flex items-center gap-2"
              >
                <Check className="h-12 w-12" strokeWidth={1.3} />
                <div>
                  <span className="text-[0.65rem] text-foreground/70">
                    Done
                  </span>
                  <p className="text-3xl font-semibold">
                    {doneClassworks?.length ?? 0}
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
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
            <div className="mt-2 flex w-full flex-col items-start gap-2 rounded-xl md:grid md:grid-cols-2 lg:grid-cols-3">
              {(searchParams.get("sort") === "all-classes" ||
                searchParams.get("sort") === "created-classes" ||
                searchParams.get("sort") === null) && (
                <ClassroomLists
                  type="created"
                  classes={createdClasses as Classroom[] | null}
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
                  classes={enrolledClasses as EnrolledClass[] | null}
                  classesIsPending={enrolledClassesIsPending}
                  handleDeleteClass={deleteClass}
                  deleteClassIsPending={deleteClassIsPending}
                />
              )}
            </div>
          )}
        </div>
        <Card className="hidden w-[18rem] md:block">
          <CardHeader className="px-4 pb-0 pt-4 text-lg font-medium tracking-tight">
            To-do
          </CardHeader>
          <CardContent className="p-4">
            <Tabs defaultValue="assigned" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="assigned"
                  onClick={() => setToDoFilter("assigned")}
                >
                  Assigned
                </TabsTrigger>
                <TabsTrigger
                  value="missing"
                  onClick={() => setToDoFilter("missing")}
                >
                  Missing
                </TabsTrigger>
                <TabsTrigger value="done" onClick={() => setToDoFilter("done")}>
                  Done
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <ul className="mt-2 grid w-full gap-2">
              {toDoFilter === "assigned" && assignedClassworks?.length
                ? assignedClassworks.map((assignedClasswork) => {
                    return (
                      <li key={assignedClasswork.id}>
                        <Link
                          href={`/classroom/class/${assignedClasswork.classId}/stream/${assignedClasswork.id}`}
                          className="group flex w-full items-center justify-between gap-2 rounded-xl border bg-card p-4 shadow-sm"
                        >
                          <div className="flex gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="mt-1 size-6 flex-shrink-0 stroke-sidebar-ring"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                              />
                            </svg>
                            <div>
                              <p className="font-medium group-hover:underline">
                                {assignedClasswork.title}
                              </p>
                              <p className="text-xs">
                                {assignedClasswork.className}
                              </p>
                              <div className="mt-2 grid items-center gap-1 text-xs">
                                <p>
                                  Posted{" "}
                                  {isToday(assignedClasswork.createdAt)
                                    ? "today"
                                    : isYesterday(assignedClasswork.createdAt)
                                      ? "yesterday"
                                      : format(
                                          assignedClasswork.createdAt,
                                          "MMM d",
                                        )}
                                </p>
                                {assignedClasswork.dueDate ? (
                                  <p className="text-xs text-foreground/70">
                                    {isToday(assignedClasswork.dueDate)
                                      ? `Due today, ${format(assignedClasswork.dueDate, "h:mm a")}`
                                      : isYesterday(assignedClasswork.dueDate)
                                        ? `Due yesterday, ${format(assignedClasswork.dueDate, "h:mm a")}`
                                        : `Due ${format(assignedClasswork.dueDate, "MMM d,")} ${isThisYear(assignedClasswork.dueDate) ? "" : `${format(assignedClasswork.dueDate, "y ")}`} ${format(assignedClasswork.dueDate, "h:mm a")}`}
                                  </p>
                                ) : (
                                  <p className="text-xs text-foreground/70">
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
                          href={`/classroom/class/${missingClasswork.classId}/stream/${missingClasswork.id}`}
                          className="group flex w-full items-center justify-between gap-2 rounded-xl border bg-card p-4 shadow-sm"
                        >
                          <div className="flex gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="mt-1 size-6 flex-shrink-0 stroke-sidebar-ring"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                              />
                            </svg>
                            <div>
                              <p className="font-medium group-hover:underline">
                                {missingClasswork.title}
                              </p>
                              <p className="text-xs">
                                {missingClasswork.className}
                              </p>
                              <div className="mt-2 grid items-center gap-1 text-xs">
                                <p>
                                  Posted{" "}
                                  {isToday(missingClasswork.createdAt)
                                    ? "today"
                                    : isYesterday(missingClasswork.createdAt)
                                      ? "yesterday"
                                      : format(
                                          missingClasswork.createdAt,
                                          "MMM d",
                                        )}
                                </p>
                                {missingClasswork.dueDate && (
                                  <p className="text-xs text-destructive">
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
                        href={`/classroom/class/${doneClasswork.classId}/stream/${doneClasswork.streamId}`}
                        className="group flex w-full items-center justify-between gap-2 rounded-xl border bg-card p-4 shadow-sm"
                      >
                        <div className="flex gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="mt-1 size-6 flex-shrink-0 stroke-sidebar-ring"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <div>
                            <p className="font-medium group-hover:underline">
                              {doneClasswork.title}
                            </p>
                            <p className="text-xs">{doneClasswork.className}</p>
                            <div className="mt-2 grid items-center gap-1 text-xs">
                              <p>
                                Posted{" "}
                                {isToday(doneClasswork.streamCreatedAt)
                                  ? "today"
                                  : isYesterday(doneClasswork.streamCreatedAt)
                                    ? "yesterday"
                                    : format(
                                        doneClasswork.streamCreatedAt,
                                        "MMM d",
                                      )}
                              </p>
                              <p className="whitespace-nowrap">
                                {doneClasswork.isGraded &&
                                doneClasswork.isTurnedIn
                                  ? `Score: ${doneClasswork.points}`
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
          </CardContent>
        </Card>
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
      <Sheet open={fabIsOpen && isMobile} onOpenChange={handleToggleShowFab}>
        <SheetContent side="bottom" className="md:hidden">
          <SheetHeader>
            <SheetTitle>Add a new class</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                handleToggleShowJoinClass();
                handleToggleShowFab();
              }}
            >
              Join class
            </Button>
            <Button
              variant="default"
              onClick={() => {
                handleToggleShowClassForm();
                handleToggleShowFab();
              }}
            >
              Create class
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <div className="fixed bottom-8 right-6 z-50 block md:hidden">
        <Button
          onClick={handleToggleShowFab}
          className="flex items-center justify-center p-8"
          size="icon"
        >
          <PlusIcon
            className={`transform transition-transform duration-300 ease-in-out ${
              fabIsOpen ? "rotate-45" : "rotate-0"
            }`}
            style={{ scale: 2 }}
          />
        </Button>
      </div>
    </section>
  );
}
