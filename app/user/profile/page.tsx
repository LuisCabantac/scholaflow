import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import {
  getRoleRequest,
  getUserByEmail,
  getUserByUserId,
} from "@/lib/data-service";
import { closeAccount } from "@/lib/user-management-actions";

import ProfileSection from "@/components/ProfileSection";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth();

  const user = await getUserByUserId(session?.user?.id ?? "");

  return {
    title: user?.fullName,
    description:
      "View and manage your profile information, settings, and connected accounts.",
  };
}

export default async function Page() {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

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
      session={session}
      onGetUser={handleGetUser}
      onCloseProfile={handleCloseProfile}
      existingRequest={existingRequest}
    />
  );
}
