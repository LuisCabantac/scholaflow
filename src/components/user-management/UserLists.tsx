import type { User } from "@/lib/schema";

import UserCard from "@/components/user-management/UserCard";

export default function UserLists({
  users,
  currentUserId,
  onDeleteUser,
  deleteUserIsPending,
}: {
  users: User[];
  currentUserId: string;
  onDeleteUser: (userId: string) => void;
  deleteUserIsPending: boolean;
}) {
  return (
    <>
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          isSelf={user.id === currentUserId}
          onDeleteUser={onDeleteUser}
          deleteUserIsPending={deleteUserIsPending}
        />
      ))}
    </>
  );
}
