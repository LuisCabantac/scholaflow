import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { getAllMessagesByClassId } from "@/lib/message-service";
import {
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/classroom-service";

import ClassChatSection from "@/components/ClassChatSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classId: string }>;
}): Promise<Metadata> {
  const { classId } = await params;

  const classroom = await getClassByClassId(classId);

  return {
    title: `Chat - ${classroom?.name}`,
    description: `Connect with your classmates! Discuss course material, ask questions, and collaborate in ${classroom?.name} class chat.  `,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/");

  const classroom = await getClassByClassId(classId);
  if (!classroom) return redirect("/classroom");

  const isTeacher = classroom.teacherId === session.user.id;
  const isEnrolled =
    (await getEnrolledClassByClassAndSessionId(session.user.id, classId)) !==
    null;

  if (!isTeacher && !isEnrolled) return redirect("/classroom");

  async function getAllMessages(classId: string) {
    "use server";
    const data = await getAllMessagesByClassId(classId);
    return data;
  }

  return (
    <ClassChatSection
      classId={classId}
      session={session.user}
      onGetAllMessages={getAllMessages}
    />
  );
}
