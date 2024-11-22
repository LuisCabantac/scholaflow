import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

import {
  getClassByClassCode,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/data-service";

import Nav from "@/components/Nav";
import InviteSection from "@/components/InviteSection";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { classCode } = params;

  const classroom = await getClassByClassCode(classCode);

  return {
    title: `Join - ${classroom?.className}`,
    description:
      classroom?.classDescription || `${classroom?.className} class.`,
  };
}

export default async function Page({ params }: { params: Params }) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  const { classCode } = params;

  const classroom = await getClassByClassCode(classCode);

  if (!classroom) return redirect("/user/classroom");

  const enrolledUser = await getEnrolledClassByClassAndSessionId(
    classroom.classroomId,
  );

  if (enrolledUser || session.user.id === classroom.teacherId)
    return redirect("/user/classroom");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(116,143,252,0.3),rgba(255,255,255,0))]">
      <div className="absolute left-0 top-1.5 md:-top-0.5">
        <Nav showButton={false} />
      </div>
      <InviteSection classroom={classroom} session={session} />
    </div>
  );
}
