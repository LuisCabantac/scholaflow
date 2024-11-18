import Image from "next/image";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getUser, getUserByUserId } from "@/lib/data-service";

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

  if (!session) return redirect("/signin");

  const userEmail = session?.user?.email ?? "";
  const {
    // role,
    // email: currentUserEmail,
    fullName,
    // password,
    // school,
    // course,
    // gender,
    avatar,
    // updatedProfile,
  } = await getUser(userEmail);

  return (
    <section className="mt-10">
      <div className="">
        <div className="relative h-40 w-40 rounded-full">
          <Image
            src={avatar}
            alt={`${fullName}'s photo`}
            fill
            className="h-full w-full rounded-full"
          />
        </div>
        <div>
          <h2 className="text-3xl font-semibold">{fullName}</h2>
          <p>{userEmail}</p>
        </div>
      </div>
    </section>
  );
}
