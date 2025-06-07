import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import {
  generateVerificationToken,
  getVerificationToken,
} from "@/lib/auth-service";
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

  async function generateVerificationTokenClient(email: string) {
    "use server";
    const verification = await generateVerificationToken(email);
    return verification;
  }

  async function handleGetVerificationToken(email: string) {
    "use server";
    const verification = await getVerificationToken(email);
    return verification;
  }

  const existingRequest = await getRoleRequest(session.user.id);

  return (
    <ProfileSection
      session={session.user}
      onGetUser={handleGetUser}
      onGetVerificationToken={handleGetVerificationToken}
      onGenerateVerificationToken={generateVerificationTokenClient}
      existingRequest={existingRequest}
    />
  );
}
