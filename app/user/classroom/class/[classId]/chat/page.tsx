import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import {
  getAllMessagesByClassId,
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/data-service";

import ClassChatSection from "@/components/ClassChatSection";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { classId } = params;

  const classroom = await getClassByClassId(classId);

  return {
    title: `Chat - ${classroom?.className}`,
    description: `Connect with your classmates! Discuss course material, ask questions, and collaborate in ${classroom?.className} class chat.  `,
  };
}

export default async function Page({ params }: { params: Params }) {
  const { classId } = params;
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/");

  const enrolledClass = await getEnrolledClassByClassAndSessionId(classId);
  const classroom = await getClassByClassId(classId);
  if (!classroom) return redirect("/user/classroom");
  if (!enrolledClass && classroom?.teacherId !== session.user.id)
    return redirect("/user/classroom");

  async function getAllMessages(classId: string) {
    "use server";
    const data = await getAllMessagesByClassId(classId);
    return data;
  }

  return (
    <ClassChatSection
      classId={classId}
      session={session}
      onGetAllMessages={getAllMessages}
    />
  );
}
