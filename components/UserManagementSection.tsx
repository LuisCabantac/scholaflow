"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import UserLists from "@/components/UserLists";
import Button from "@/components/Button";
import UserListLoading from "@/components/UserListsLoading";
import UserNotFound from "@/components/UserNotFound";
import AddUserForm from "@/components/AddUserForm";

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
  course: string;
  courseName: string;
  strand: string;
  strandName: string;
  gradeLevel: string;
  level: string;
  levelName: number;
  kindergarten: number;
  kindergartenName: string;
}

export default function UserManagementSection({
  id,
  role,
  onGetUsers,
  onDeleteUser,
  onCheckEmail,
}: {
  id: string;
  role: string;

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
  const [showAddUserForm, setShowAddUserForm] = useState(false);
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

  function handleToggleShowAddUserForm() {
    if (role === "admin") setShowAddUserForm(!showAddUserForm);
  }

  return (
    <>
      {!showAddUserForm ? (
        <div className="">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-medium">All users</h2>
            <div className="flex gap-2">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users"
                className="hidden rounded-md border-2 border-[#bec2cc] bg-[#f3f6ff] px-4 py-2 text-sm focus:border-[#384689] focus:outline-none md:inline md:w-48"
              />
              <Button type="primary" onClick={handleToggleShowAddUserForm}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4 md:size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
                  />
                </svg>
                <span>Add user</span>
              </Button>
            </div>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="mb-4 block w-full rounded-md border-2 border-[#bec2cc] bg-[#f3f6ff] px-4 py-2 focus:border-[#384689] focus:outline-none md:hidden"
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
                    id={id}
                    handleDeleteUser={deleteUser}
                    deleteUserIsPending={deleteUserIsPending}
                  />
                ) : null}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <AddUserForm
          onShowAddUserForm={handleToggleShowAddUserForm}
          onCheckEmail={onCheckEmail}
        />
      )}
    </>
  );
}
