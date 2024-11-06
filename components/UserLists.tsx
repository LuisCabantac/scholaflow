import { useOptimistic } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

import { IUser } from "@/components/UserManagementSection";
import UserCard from "@/components/UserCard";

export default function UserLists({
  id,
  results,
  handleDeleteUser,
  deleteUserIsPending,
}: {
  id: string;
  results:
    | { success: boolean; message: string; data: null }
    | { success: boolean; message: string; data: IUser[] }
    | undefined;
  handleDeleteUser: UseMutateFunction<void, Error, string, unknown>;
  deleteUserIsPending: boolean;
}) {
  const [optimisticUser, optimisticDelete] = useOptimistic(
    results?.data,
    (curUser, userId) => {
      return curUser?.filter((user) => user.id !== userId);
    },
  );

  function handleUserDelete(userId: string) {
    optimisticDelete(userId);
    handleDeleteUser(userId);
  }

  return (
    <>
      {optimisticUser &&
        optimisticUser.map((user) => (
          <UserCard
            key={user.id}
            sessionId={id}
            id={user.id}
            fullName={user.fullName}
            avatar={user.avatar}
            email={user.email}
            role={user.role}
            createdAt={user.created_at}
            verified={user.verified}
            onDeleteUser={handleUserDelete}
            deleteUserIsPending={deleteUserIsPending}
          />
        ))}
    </>
  );
}
