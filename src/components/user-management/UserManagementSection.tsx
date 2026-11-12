import { toast } from "sonner";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type { User } from "@/lib/schema";
import { filterUsers } from "@/lib/user-search";
import type { SessionUser } from "@/types/auth";
import { userKeys, userQueries } from "@/queries/user";
import { userManagementKeys } from "@/queries/user-management";
import type { RoleRequestStatus } from "@/types/user-management";
import { closeAccountFn } from "@/server/functions/user-management";

import { Button } from "@/components/ui/button";
import UserForm from "@/components/user-management/UserForm";
import UserLists from "@/components/user-management/UserLists";
import UserSearch from "@/components/user-management/UserSearch";
import UserNotFound from "@/components/user-management/UserNotFound";
import UserTableHead from "@/components/user-management/UserTableHead";
import RoleRequestsSection from "@/components/user-management/RoleRequestsSection";

export default function UserManagementSection({
  user,
  sort,
}: {
  user: SessionUser;
  sort: RoleRequestStatus | undefined;
}) {
  const { t } = useTranslation("userManagement");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);

  const { data: users } = useSuspenseQuery(userQueries.list());
  const visibleUsers = filterUsers(users, search);

  const removeUser = useMutation({
    mutationFn: async (userId: string) => {
      const result = await closeAccountFn({ data: userId });
      if (!result.success) throw new Error(result.message);
    },
    onMutate: async (userId) => {
      const key = userKeys.list();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (current: User[] | undefined) =>
        current?.filter((item) => item.id !== userId),
      );
      return { key, previous };
    },
    onError: (error, _userId, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success(t("messages.userRemoved")),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userManagementKeys.all });
    },
  });

  return (
    <section className="grid gap-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <UserSearch value={search} onChange={setSearch} />
          <Button type="button" onClick={() => setShowUserForm(true)}>
            <UserPlus className="h-12 w-12" />
            {t("createUser")}
          </Button>
        </div>
        {visibleUsers.length === 0 ? (
          <UserNotFound />
        ) : (
          <table className="bg-muted w-full border-collapse rounded-md text-sm">
            <tbody>
              <UserTableHead />
              <UserLists
                users={visibleUsers}
                currentUserId={user.id}
                onDeleteUser={(userId) => removeUser.mutate(userId)}
                deleteUserIsPending={removeUser.isPending}
              />
            </tbody>
          </table>
        )}
        {showUserForm && (
          <UserForm type="create" onClose={() => setShowUserForm(false)} />
        )}
      </div>
      <RoleRequestsSection sort={sort} />
    </section>
  );
}
