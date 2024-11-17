"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { IClass } from "@/components/ClassroomSection";
import ClassPeopleCard from "@/components/ClassPeopleCard";
import Button from "@/components/Button";
import AddUserToClassModal from "@/components/AddUserToClassModal";

export default function ClassPeopleSection({
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
        <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 text-sm font-medium shadow-sm md:text-base">
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
          <p className="font-medium md:text-lg">All users</p>
          {sessionId === classroom.teacherId && (
            <Button type="primary" onClick={handleToggleShowAddUserModal}>
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
                  d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                />
              </svg>
              <span>Add user</span>
            </Button>
          )}
          {showAddUserModal && (
            <AddUserToClassModal
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
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-[#dbe4ff]"></div>
                      <div className="h-4 w-24 animate-pulse rounded-md bg-[#dbe4ff]"></div>
                    </div>
                  </li>
                ))}
            </>
          ) : (
            <>
              <li className="flex items-center justify-between bg-[#f3f6ff] p-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="relative h-8 w-8">
                    <Image
                      src={classroom.teacherAvatar}
                      alt={`${classroom.teacherName}'s image`}
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <p>{classroom.teacherName}</p>
                  <span className="role teacher flex w-24 items-center justify-center rounded-md p-1 text-[0.65rem] font-semibold md:p-2 md:text-xs">
                    TEACHER
                  </span>
                </div>
              </li>
              {enrolledUsers &&
                enrolledUsers?.map((user) => (
                  <ClassPeopleCard
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
