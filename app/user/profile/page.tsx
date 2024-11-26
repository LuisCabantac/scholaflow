import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import { getUser, getUserByUserId } from "@/lib/data-service";

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

  const user = await getUser(session.user.email);

  return <ProfileSection user={user} />;
}
