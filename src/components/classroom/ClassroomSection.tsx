import { toast } from "sonner";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, ChevronDown, PlusIcon } from "lucide-react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { useNow } from "@/hooks/use-now";
import type { SessionUser } from "@/types/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ClassroomSort } from "@/types/classroom";
import { useClickOutside } from "@/hooks/use-click-outside";
import { streamKeys, streamQueries } from "@/queries/stream";
import type { Classroom, EnrolledClass } from "@/lib/schema";
import { classroomKeys, classroomQueries } from "@/queries/classroom";
import { classworkKeys, classworkQueries } from "@/queries/classwork";
import { deleteClassFn, joinClassFn } from "@/server/functions/classroom";
import {
  assignedClassworks,
  doneClassworks,
  missingClassworks,
} from "@/lib/classwork-buckets";

import { Button } from "@/components/ui/button";
import ToDoCard from "@/components/classroom/ToDoCard";
import ClassForm from "@/components/classroom/ClassForm";
import NoClasses from "@/components/classroom/NoClasses";
import ToDoStrip from "@/components/classroom/ToDoStrip";
import ClassroomLists from "@/components/classroom/ClassroomLists";
import JoinClassDialog from "@/components/classroom/JoinClassDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sortOptions: {
  value: ClassroomSort;
  key: "allClasses" | "createdClasses" | "enrolledClasses";
}[] = [
  { value: "all-classes", key: "allClasses" },
  { value: "created-classes", key: "createdClasses" },
  { value: "enrolled-classes", key: "enrolledClasses" },
];

export default function ClassroomSection({
  user,
  sort,
}: {
  user: SessionUser;
  sort: ClassroomSort;
}) {
  const navigate = useNavigate();
  const now = useNow();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { t } = useTranslation("classroom");

  const filterWrapperRef = useRef<HTMLDivElement>(null);

  const [fabIsOpen, setFabIsOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showJoinClass, setShowJoinClass] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const { data: classworks } = useSuspenseQuery(
    classworkQueries.byUser(user.id),
  );
  const { data: createdClasses } = useSuspenseQuery(
    classroomQueries.byTeacher(user.id),
  );
  const { data: enrolledClasses } = useSuspenseQuery(
    classroomQueries.enrolledByUser(user.id),
  );
  const { data: enrolledClassworks } = useSuspenseQuery(
    streamQueries.enrolledClassworks(user.id),
  );

  const assigned = assignedClassworks(
    enrolledClassworks,
    classworks,
    user.id,
    now,
  );
  const missing = missingClassworks(
    enrolledClassworks,
    classworks,
    user.id,
    now,
  );
  const done = doneClassworks(classworks, enrolledClasses);

  const deleteClass = useMutation({
    mutationFn: async (classId: string) => {
      const result = await deleteClassFn({ data: classId });
      if (!result.success) throw new Error(result.message);
    },
    onMutate: async (classId) => {
      await queryClient.cancelQueries({ queryKey: classroomKeys.all });
      const createdKey = classroomKeys.byTeacher(user.id);
      const enrolledKey = classroomKeys.enrolledByUser(user.id);
      const previousCreated = queryClient.getQueryData<Classroom[] | null>(
        createdKey,
      );
      const previousEnrolled = queryClient.getQueryData<EnrolledClass[] | null>(
        enrolledKey,
      );
      queryClient.setQueryData<Classroom[] | null>(createdKey, (old) =>
        old ? old.filter((item) => item.id !== classId) : old,
      );
      queryClient.setQueryData<EnrolledClass[] | null>(enrolledKey, (old) =>
        old ? old.filter((item) => item.classId !== classId) : old,
      );
      return { previousCreated, previousEnrolled, createdKey, enrolledKey };
    },
    onError: (error, _classId, context) => {
      if (context) {
        queryClient.setQueryData(context.createdKey, context.previousCreated);
        queryClient.setQueryData(context.enrolledKey, context.previousEnrolled);
      }
      toast.error(error.message);
    },
    onSuccess: () => toast.success(t("messages.deleted")),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.all });
      queryClient.invalidateQueries({ queryKey: classworkKeys.all });
      queryClient.invalidateQueries({ queryKey: streamKeys.all });
    },
  });

  const showCreated = sort === "all-classes" || sort === "created-classes";
  const showEnrolled = sort === "all-classes" || sort === "enrolled-classes";
  const hasCreated = !!createdClasses?.length;
  const hasEnrolled = !!enrolledClasses?.length;
  const isEmpty =
    (!hasCreated && !hasEnrolled) ||
    (sort === "created-classes" && !hasCreated) ||
    (sort === "enrolled-classes" && !hasEnrolled);

  async function handleJoinClass(code: string) {
    setIsJoining(true);
    try {
      const classroom = await queryClient.fetchQuery(
        classroomQueries.byCode(code),
      );
      if (!classroom) {
        toast.error(t("join.notFound"));
        return;
      }

      const enrolled = await queryClient.fetchQuery(
        classroomQueries.enrolledByClassAndSession(user.id, classroom.id),
      );
      if (classroom.teacherId === user.id || enrolled) {
        toast.error(t("join.alreadyIn"));
        return;
      }

      const result = await joinClassFn({ data: classroom.id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: classroomKeys.all }),
        queryClient.invalidateQueries({ queryKey: classworkKeys.all }),
        queryClient.invalidateQueries({ queryKey: streamKeys.all }),
      ]);
      setShowJoinClass(false);
      await navigate({
        to: "/classroom/class/$classId",
        params: { classId: classroom.id },
      });
    } finally {
      setIsJoining(false);
    }
  }

  function handleToggleShowFab() {
    setFabIsOpen((prev) => !prev);
  }

  useClickOutside(filterWrapperRef, () => setShowFilterDropdown(false), false);

  return (
    <section className="relative overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div
            className="flex items-center justify-between"
            ref={filterWrapperRef}
          >
            <DropdownMenu onOpenChange={setShowFilterDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-auto p-0 hover:bg-transparent"
                >
                  <span className="text-base">
                    {t(
                      `filters.${sortOptions.find((o) => o.value === sort)?.key ?? "allClasses"}`,
                    )}
                  </span>
                  <ChevronDown
                    strokeWidth={3}
                    className={`${showFilterDropdown ? "rotate-180" : "rotate-0"} h-4 w-4 transition-transform`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sortOptions.map((option) => (
                  <DropdownMenuItem key={option.value} asChild>
                    <Link
                      to="/classroom"
                      search={{ sort: option.value }}
                      className={`${sort === option.value ? "font-medium" : "text-foreground/70"} flex w-full items-center justify-between gap-2 rounded-xl p-2 text-left text-nowrap`}
                    >
                      <span>{t(`filters.${option.key}`)}</span>
                      {sort === option.value && (
                        <Check strokeWidth={3} className="h-4 w-4" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden md:flex" asChild>
                <Button>
                  <PlusIcon className="h-12 w-12" />
                  {t("actions.addClass")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="hidden md:block">
                <DropdownMenuItem asChild>
                  <button
                    type="button"
                    onClick={() => setShowJoinClass(true)}
                    className="w-full text-start"
                  >
                    {t("actions.joinClass")}
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button
                    type="button"
                    onClick={() => setShowClassForm(true)}
                    className="w-full text-start"
                  >
                    {t("actions.createClass")}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ToDoStrip
            assignedCount={assigned.length}
            missingCount={missing.length}
            doneCount={done.length}
          />
          {isEmpty ? (
            <NoClasses />
          ) : (
            <div className="mt-2 flex w-full flex-col items-start gap-2 rounded-xl md:grid md:grid-cols-2 lg:grid-cols-3">
              {showCreated && (
                <ClassroomLists
                  type="created"
                  classes={createdClasses}
                  onDeleteClass={deleteClass.mutate}
                  deleteClassIsPending={deleteClass.isPending}
                />
              )}
              {showEnrolled && (
                <ClassroomLists
                  type="enrolled"
                  classes={enrolledClasses}
                  onDeleteClass={deleteClass.mutate}
                  deleteClassIsPending={deleteClass.isPending}
                />
              )}
            </div>
          )}
        </div>
        <ToDoCard assigned={assigned} missing={missing} done={done} />
      </div>
      {showClassForm && (
        <ClassForm
          type="create"
          user={user}
          onClose={() => setShowClassForm(false)}
        />
      )}
      {showJoinClass && (
        <JoinClassDialog
          isLoading={isJoining}
          onJoinClass={handleJoinClass}
          onClose={() => setShowJoinClass(false)}
        />
      )}
      <Sheet open={fabIsOpen && isMobile} onOpenChange={handleToggleShowFab}>
        <SheetContent side="bottom" className="md:hidden">
          <SheetHeader>
            <SheetTitle>{t("sheet.title")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowJoinClass(true);
                handleToggleShowFab();
              }}
            >
              {t("actions.joinClass")}
            </Button>
            <Button
              variant="default"
              onClick={() => {
                setShowClassForm(true);
                handleToggleShowFab();
              }}
            >
              {t("actions.createClass")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <div className="fixed right-6 bottom-8 z-10 block md:hidden">
        <Button
          onClick={handleToggleShowFab}
          className="flex items-center justify-center p-8"
          size="icon"
          aria-label={t("actions.addClass")}
        >
          <PlusIcon
            className={`transform transition-transform duration-300 ease-in-out ${fabIsOpen ? "rotate-45" : "rotate-0"}`}
            style={{ scale: 2 }}
          />
        </Button>
      </div>
    </section>
  );
}
