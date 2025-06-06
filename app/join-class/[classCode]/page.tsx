import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import {
  getClassByClassCode,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/classroom-service";

import Nav from "@/components/Nav";
import InviteSection from "@/components/InviteSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classCode: string }>;
}): Promise<Metadata> {
  const { classCode } = await params;

  const classroom = await getClassByClassCode(classCode);

  return {
    title: `Join - ${classroom?.name}`,
    description: classroom?.description || `${classroom?.name} class.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ classCode: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  const { classCode } = await params;

  const classroom = await getClassByClassCode(classCode);

  if (!classroom) return redirect("/classroom");

  const enrolledUser = await getEnrolledClassByClassAndSessionId(
    session.user.id,
    classroom.id,
  );

  if (enrolledUser || session.user.id === classroom.teacherId)
    return redirect("/classroom");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f3f6ff] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(116,143,252,0.2),rgba(255,255,255,0))]">
      <div className="absolute left-0 top-1.5 md:-top-0.5">
        <Nav showButton={false} />
      </div>
      <InviteSection classroom={classroom} session={session.user} />
    </div>
  );
}
