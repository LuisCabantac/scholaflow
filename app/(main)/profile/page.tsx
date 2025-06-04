import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { closeAccount } from "@/lib/user-management-actions";
import { getRoleRequest } from "@/lib/user-management-service";
import { getUserByEmail, getUserByUserId } from "@/lib/user-service";

import ProfileSection from "@/components/ProfileSection";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = await getUserByUserId(session?.user?.id ?? "");

  return {
    title: user?.name,
    description:
      "View and manage your profile information, settings, and connected accounts.",
  };
}

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  async function handleGetUser(email: string) {
    "use server";
    const user = await getUserByEmail(email);
    return user;
  }

  async function handleCloseProfile(userId: string) {
    "use server";
    await closeAccount(userId);
  }

  const existingRequest = await getRoleRequest(session.user.id);

  return (
    <ProfileSection
      session={session.user}
      onGetUser={handleGetUser}
      onCloseProfile={handleCloseProfile}
      existingRequest={existingRequest}
    />
  );
}
