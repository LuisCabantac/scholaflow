"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { IClass } from "@/components/ClassroomSection";
import PeopleCard from "@/components/PeopleCard";
import Button from "@/components/Button";
import AddUserToClassDialog from "@/components/AddUserToClassDialog";

export default function PeopleSection({
  classId,
  sessionId,
  classroom,
  onDeleteClass,
  onGetAllEnrolledClasses,
}: {
  classId: string;
  sessionId: string;
  classroom: IClass;
  onDeleteClass: (enrolledClassId: string) => Promise<void>;
  onGetAllEnrolledClasses: (classId: string) => Promise<IClass[] | null>;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const { data: enrolledUsers, isPending: enrolledUsersIsPending } = useQuery({
    queryKey: ["enrolledUsersClasses"],
    queryFn: () => onGetAllEnrolledClasses(classId),
  });

  const { mutate: deleteClass, isPending: deleteClassIsPending } = useMutation({
    mutationFn: onDeleteClass,
    onSuccess: () => {
      toast.success("User has been successfully removed.");
      router.refresh();

      queryClient.invalidateQueries({
        queryKey: ["enrolledUsersClasses"],
      });
    },
    onError: (error) => toast.error(error.message),
  });

  function handleToggleShowAddUserModal() {
    setShowAddUserModal(!showAddUserModal);
  }

  return (
    <section>
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
          <Link
            href={`/user/classroom/class/${classId}`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Stream
          </Link>
          <Link
            href={`/user/classroom/class/${classId}/classwork`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Classwork
          </Link>
          <Link
            href={`/user/classroom/class/${classId}/people`}
            className="rounded-md bg-[#edf2ff] px-3 py-2 shadow-sm transition-all"
          >
            People
          </Link>
          <Link
            href={`/user/classroom/class/${classId}/chat`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Chat
          </Link>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <p className="text-base font-medium">All users</p>
          {sessionId === classroom.teacherId && (
            <Button type="primary" onClick={handleToggleShowAddUserModal}>
              Add user
            </Button>
          )}
          {showAddUserModal && (
            <AddUserToClassDialog
              classId={classId}
              onToggleShowAddUserToClass={handleToggleShowAddUserModal}
              handleSetShowAddUserModal={setShowAddUserModal}
            />
          )}
        </div>
        <ul className="users__list rounded-md border-2 border-[#dbe4ff]">
          {enrolledUsersIsPending ? (
            <>
              {Array(11)
                .fill(undefined)
                .map((_, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-[#f3f6ff] p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-[#dbe4ff]"></div>
                      <div className="h-4 w-24 animate-pulse rounded-md bg-[#dbe4ff]"></div>
                    </div>
                  </li>
                ))}
            </>
          ) : (
            <>
              <li className="flex items-center justify-between bg-[#f3f6ff] p-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-8 w-8">
                    <Image
                      src={classroom.teacherAvatar}
                      alt={`${classroom.teacherName}'s image`}
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <p>{classroom.teacherName}</p>
                  <span className="role teacher mt-1 flex items-center justify-center rounded-md px-2 py-1 text-[0.65rem] font-semibold">
                    TEACHER
                  </span>
                </div>
              </li>
              {enrolledUsers &&
                enrolledUsers?.map((user) => (
                  <PeopleCard
                    key={user.id}
                    user={user}
                    classroom={classroom}
                    sessionId={sessionId}
                    handleDeleteClass={deleteClass}
                    deleteClassIsPending={deleteClassIsPending}
                  />
                ))}
            </>
          )}
        </ul>
      </div>
    </section>
  );
}
