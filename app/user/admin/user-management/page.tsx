import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import { checkEmail } from "@/lib/auth-actions";
import { getAllLevels, getAllUser, getUsersFilter } from "@/lib/data-service";
import { deleteUser } from "@/lib/user-management-actions";
import { ILevels } from "@/app/user/announcements/page";

import UserManagementSection from "@/components/UserManagementSection";

export default async function Page() {
  const session = await auth();

  if (!hasUser(session)) redirect("/signin");

  if (session.user.role !== "admin") redirect("/user/classroom");

  const allLevels = await getAllLevels();

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
    await deleteUser(userId);
  }

  async function handleCheckEmail(formData: FormData) {
    "use server";
    const {
      success: { status },
    } = await checkEmail(formData);
    return status;
  }

  return (
    <section>
      <UserManagementSection
        id={session.user.id}
        role={session.user.role}
        onGetUsers={handleGetUsers}
        onDeleteUser={handleDeleteUser}
        onCheckEmail={handleCheckEmail}
        allLevels={allLevels as ILevels[]}
      />
    </section>
  );
}
