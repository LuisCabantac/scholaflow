import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import {
  getAllEnrolledClassesByClassId,
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/classroom-service";
import { deleteEnrolledClassbyClassAndEnrolledClassId } from "@/lib/classroom-actions";

import PeopleSection from "@/components/PeopleSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classId: string }>;
}): Promise<Metadata> {
  const { classId } = await params;

  const classroom = await getClassByClassId(classId);

  return {
    title: `People - ${classroom?.name}`,
    description: `See who's in ${classroom?.name} class! This page lists all students enrolled in this course. `,
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
    (await getEnrolledClassByClassAndSessionId(classId)) !== null;

  if (!isTeacher && !isEnrolled) return redirect("/classroom");

  async function handleGetAllEnrolledClassesByClassId(classId: string) {
    "use server";
    const data = await getAllEnrolledClassesByClassId(classId);
    return data;
  }

  async function handleDeleteClassByClassId(enrolledClassId: string) {
    "use server";
    await deleteEnrolledClassbyClassAndEnrolledClassId(
      enrolledClassId,
      classId,
    );
  }

  return (
    <PeopleSection
      classId={classId}
      sessionId={session.user.id}
      classroom={classroom}
      onDeleteClass={handleDeleteClassByClassId}
      onGetAllEnrolledClasses={handleGetAllEnrolledClassesByClassId}
    />
  );
}
