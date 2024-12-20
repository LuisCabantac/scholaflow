import { Metadata } from "next";
import { redirect } from "next/navigation";

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
  params: Promise<{ classId: string }>;
}): Promise<Metadata> {
  const { classId } = await params;

  const classroom = await getClassByClassId(classId);

  return {
    title: `Chat - ${classroom?.className}`,
    description: `Connect with your classmates! Discuss course material, ask questions, and collaborate in ${classroom?.className} class chat.  `,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/");

  const classroom = await getClassByClassId(classId);
  if (!classroom) return redirect("/user/classroom");

  const isTeacher = classroom.teacherId === session.user.id;
  const isEnrolled =
    (await getEnrolledClassByClassAndSessionId(classId)) !== null;

  if (!isTeacher && !isEnrolled) return redirect("/user/classroom");

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
