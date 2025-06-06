import { UseMutateFunction } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useOptimistic } from "react";

import UserCard from "@/components/UserCard";
import { Session } from "@/lib/schema";

export default function UserLists({
  results,
  onCheckEmail,
  handleDeleteUser,
  onSetShowUserForm,
  deleteUserIsPending,
}: {
  results:
    | { success: boolean; message: string; data: null }
    | { success: boolean; message: string; data: Session[] }
    | undefined;
  onCheckEmail: (formData: FormData) => Promise<boolean>;
  handleDeleteUser: UseMutateFunction<void, Error, string, unknown>;
  onSetShowUserForm: Dispatch<SetStateAction<boolean>>;
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
      {optimisticUser?.length
        ? optimisticUser.map((user) => (
            <UserCard
              key={user.id}
              userData={user}
              onCheckEmail={onCheckEmail}
              onDeleteUser={handleUserDelete}
              onSetShowUserForm={onSetShowUserForm}
              deleteUserIsPending={deleteUserIsPending}
            />
          ))
        : null}
    </>
  );
}
