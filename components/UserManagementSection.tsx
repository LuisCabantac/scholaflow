"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLists from "@/components/UserLists";
import Button from "@/components/Button";
import UserListLoading from "@/components/UserListsLoading";
import UserNotFound from "@/components/UserNotFound";
import UserForm from "@/components/UserForm";

export interface IUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  avatar: string;
  role: "student" | "teacher" | "admin";
  verified: boolean;
  emailVerified: boolean;
  created_at: string;
  gender: string;
  updatedProfile: boolean;
  schoolName: string;
}

export default function UserManagementSection({
  onGetUsers,
  onDeleteUser,
  onCheckEmail,
}: {
  onGetUsers: (
    name: string,
  ) => Promise<
    | { success: boolean; message: string; data: null }
    | { success: boolean; message: string; data: IUser[] }
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
    onError: (error) => toast.error(error.message),
  });

  function handleToggleShowUserForm() {
    setShowUserForm(!showUserForm);
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-medium">All users</h2>
        <div className="flex gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="hidden rounded-md border-2 border-[#bec2cc] bg-[#f3f6ff] px-5 py-3 text-sm placeholder:text-[#616572] focus:border-[#384689] focus:outline-none md:inline md:w-48"
          />
          <Button type="primary" onClick={handleToggleShowUserForm}>
            Add user
          </Button>
        </div>
      </div>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="mb-4 block w-full rounded-md border-2 border-[#dbe4ff] bg-[#eef3ff] px-5 py-3 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none md:hidden"
      />
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
          onShowUserForm={handleToggleShowUserForm}
        />
      )}
    </section>
  );
}
