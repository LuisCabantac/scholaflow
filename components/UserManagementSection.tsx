"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Session } from "@/lib/schema";

import UserForm from "@/components/UserForm";
import UserLists from "@/components/UserLists";
import UserNotFound from "@/components/UserNotFound";
import UserListLoading from "@/components/UserListsLoading";

export default function UserManagementSection({
  onGetUsers,
  onDeleteUser,
  onCheckEmail,
}: {
  onGetUsers: (
    name: string,
  ) => Promise<
    | { success: boolean; message: string; data: null }
    | { success: boolean; message: string; data: Session[] }
  >;
  onDeleteUser: (userId: string) => Promise<void>;
  onCheckEmail: (formData: FormData) => Promise<boolean>;
}) {
  const queryClient = useQueryClient();
  const [showUserForm, setShowUserForm] = useState(false);
  const [search, setSearch] = useState("");

  const { data: users, isPending: usersIsPending } = useQuery({
    queryKey: [search],
    queryFn: () => onGetUsers(search),
  });

  const { mutate: deleteUser, isPending: deleteUserIsPending } = useMutation({
    mutationFn: onDeleteUser,
    onSuccess: () => {
      toast.success("The user has been removed.");

      queryClient.invalidateQueries({
        queryKey: [search],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleToggleShowUserForm() {
    setShowUserForm(!showUserForm);
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-[60%] rounded-md border border-[#dddfe6] bg-[#eef3ff] px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none md:w-[50%]"
        />
      </div>
      {(!users?.data || users?.data.length === 0) && !usersIsPending ? (
        <UserNotFound />
      ) : (
        <table className="w-full border-collapse rounded-md bg-[#dbe4ff] text-sm">
          <tbody>
            <tr className="text-[#42444c]">
              <th className="p-2 md:px-4 md:py-2">Name</th>
              <th className="p-2 md:px-4 md:py-2">Email</th>
              <th className="p-2 md:px-4 md:py-2">Role</th>
              <th className="p-2 md:px-4 md:py-2">Date added</th>
              <th className="p-2 md:px-4 md:py-2">Verified</th>
              <th className="p-2 md:px-4 md:py-2"></th>
            </tr>
            {usersIsPending && <UserListLoading />}
            {users ? (
              <UserLists
                results={users}
                onCheckEmail={onCheckEmail}
                handleDeleteUser={deleteUser}
                onSetShowUserForm={setShowUserForm}
                deleteUserIsPending={deleteUserIsPending}
              />
            ) : null}
          </tbody>
        </table>
      )}
      {showUserForm && (
        <UserForm
          type="create"
          onCheckEmail={onCheckEmail}
          onSetShowUserForm={setShowUserForm}
          onShowUserForm={handleToggleShowUserForm}
        />
      )}
    </section>
  );
}
