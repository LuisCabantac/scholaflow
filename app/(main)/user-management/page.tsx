import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { checkEmail } from "@/lib/auth-actions";
import { closeAccount } from "@/lib/user-management-actions";
import { getAllUser, getUsersFilter } from "@/lib/data-service";

import UserManagementSection from "@/components/UserManagementSection";

export const metadata: Metadata = {
  title: "User Management",
  description:
    "Manage user accounts and permissions. This administrative area allows for control over user access and roles within the platform.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/signin");

  if (session.user.role !== "admin") redirect("/classroom");

  async function handleGetUsers(name: string) {
    "use server";

    if (!name) {
      const data = await getAllUser();
      return data;
    }

    const data = await getUsersFilter(name);
    return data;
  }

  async function handleDeleteUser(userId: string) {
    "use server";
    await closeAccount(userId);
  }

  async function handleCheckEmail(formData: FormData) {
    "use server";
    const {
      success: { status },
    } = await checkEmail(formData);
    return status;
  }

  return (
    <UserManagementSection
      onGetUsers={handleGetUsers}
      onDeleteUser={handleDeleteUser}
      onCheckEmail={handleCheckEmail}
    />
  );
}
