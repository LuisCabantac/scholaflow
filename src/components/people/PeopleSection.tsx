import { toast } from "sonner";
import { useState } from "react";
import { UserRoundPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { streamKeys } from "@/queries/stream";
import type { SessionUser } from "@/types/auth";
import { sortRoster } from "@/lib/people-roster";
import { classworkKeys } from "@/queries/classwork";
import type { Classroom, EnrolledClass } from "@/lib/schema";
import { classroomKeys, classroomQueries } from "@/queries/classroom";
import { deleteEnrolledClassbyClassAndEnrolledClassIdFn } from "@/server/functions/classroom";

import { Button } from "@/components/ui/button";
import PeopleCard from "@/components/people/PeopleCard";
import AddUserToClassDialog from "@/components/people/AddUserToClassDialog";

export default function PeopleSection({
  classroom,
  user,
}: {
  classroom: Classroom;
  user: SessionUser;
}) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("people");

  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const rosterKey = classroomKeys.enrolledByClass(classroom.id);
  const { data: enrolledUsers } = useSuspenseQuery(
    classroomQueries.enrolledByClass(classroom.id),
  );

  const isTeacher = user.id === classroom.teacherId;
  const roster = sortRoster(enrolledUsers);

  const removeUser = useMutation({
    mutationFn: async (enrolledClassId: string) => {
      const result = await deleteEnrolledClassbyClassAndEnrolledClassIdFn({
        data: { enrolledClassId, classId: classroom.id },
      });
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onMutate: async (enrolledClassId) => {
      await queryClient.cancelQueries({ queryKey: rosterKey });
      const previous = queryClient.getQueryData<EnrolledClass[] | null>(
        rosterKey,
      );
      queryClient.setQueryData<EnrolledClass[] | null>(rosterKey, (old) =>
        old ? old.filter((enrolled) => enrolled.id !== enrolledClassId) : old,
      );
      return { previous };
    },
    onError: (error, _enrolledClassId, context) => {
      queryClient.setQueryData(rosterKey, context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success(t("messages.removed"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.all });
      queryClient.invalidateQueries({ queryKey: classworkKeys.all });
      queryClient.invalidateQueries({ queryKey: streamKeys.all });
    },
  });

  return (
    <section>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <p className="text-base font-medium">{t("allUsers")}</p>
          {isTeacher && (
            <Button type="button" onClick={() => setShowAddUserModal(true)}>
              <UserRoundPlus className="h-12 w-12" />
              {t("addUser")}
            </Button>
          )}
          {showAddUserModal && (
            <AddUserToClassDialog
              classId={classroom.id}
              onClose={() => setShowAddUserModal(false)}
            />
          )}
        </div>
        <ul className="rounded-xl">
          <li className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <img
                src={classroom.teacherImage}
                alt={t("avatarAlt", { name: classroom.teacherName })}
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-full select-none"
                onDragStart={(e) => e.preventDefault()}
              />
              <p>{classroom.teacherName}</p>
              <span className="role teacher mt-1 flex items-center justify-center rounded-xl px-2 py-1 text-[0.65rem] font-semibold">
                {t("teacherBadge")}
              </span>
            </div>
          </li>
          {roster.map((enrolled) => (
            <PeopleCard
              key={enrolled.id}
              user={enrolled}
              classroom={classroom}
              sessionId={user.id}
              onRemove={removeUser.mutate}
              removeIsPending={removeUser.isPending}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
