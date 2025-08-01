"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { UserRoundPlus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Classroom, EnrolledClass } from "@/lib/schema";

import { Button } from "@/components/ui/button";
import PeopleCard from "@/components/PeopleCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  classroom: Classroom;
  onDeleteClass: (enrolledClassId: string) => Promise<void>;
  onGetAllEnrolledClasses: (classId: string) => Promise<EnrolledClass[] | null>;
}) {
  const queryClient = useQueryClient();

  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const { data: enrolledUsers, isPending: enrolledUsersIsPending } = useQuery({
    queryKey: ["enrolledUsersClasses"],
    queryFn: () => onGetAllEnrolledClasses(classId),
  });

  const { mutate: deleteClass, isPending: deleteClassIsPending } = useMutation({
    mutationFn: onDeleteClass,
    onSuccess: () => {
      toast.success("User has been successfully removed.");

      queryClient.invalidateQueries({
        queryKey: ["enrolledUsersClasses"],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleToggleShowAddUserModal() {
    setShowAddUserModal(!showAddUserModal);
  }

  return (
    <section>
      <div className="flex items-center justify-between pb-2">
        <Tabs defaultValue="people">
          <TabsList>
            <TabsTrigger value="stream" asChild>
              <Link href={`/classroom/class/${classroom.id}`}>Stream</Link>
            </TabsTrigger>
            <TabsTrigger value="classwork" asChild>
              <Link href={`/classroom/class/${classroom.id}/classwork`}>
                Classwork
              </Link>
            </TabsTrigger>
            <TabsTrigger value="people" asChild>
              <Link href={`/classroom/class/${classroom.id}/people`}>
                People
              </Link>
            </TabsTrigger>
            <TabsTrigger value="chat" asChild>
              <Link href={`/classroom/class/${classroom.id}/chat`}>Chat</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <p className="text-base font-medium">All users</p>
          {sessionId === classroom.teacherId && (
            <Button onClick={handleToggleShowAddUserModal}>
              <UserRoundPlus className="h-12 w-12" />
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
        <ul className="rounded-xl">
          {enrolledUsersIsPending ? (
            <>
              {Array(6)
                .fill(undefined)
                .map((_, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between py-2"
                    role="status"
                  >
                    <span className="sr-only">Loading…</span>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
                      <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                    </div>
                  </li>
                ))}
            </>
          ) : (
            <>
              <li className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={classroom.teacherImage}
                    alt={`${classroom.teacherName}'s image`}
                    width={32}
                    height={32}
                    className="seelct-none h-8 w-8 flex-shrink-0 rounded-full"
                    onDragStart={(e) => e.preventDefault()}
                  />
                  <p>{classroom.teacherName}</p>
                  <span className="role teacher mt-1 flex items-center justify-center rounded-xl px-2 py-1 text-[0.65rem] font-semibold">
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
