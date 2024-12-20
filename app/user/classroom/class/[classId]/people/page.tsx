import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  getAllEnrolledClassesByClassId,
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/data-service";
import { deleteEnrolledClassbyClassAndEnrolledClassId } from "@/lib/classroom-actions";
import { hasUser } from "@/lib/utils";

import PeopleSection from "@/components/PeopleSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classId: string }>;
}): Promise<Metadata> {
  const { classId } = await params;

  const classroom = await getClassByClassId(classId);

  return {
    title: `People - ${classroom?.className}`,
    description: `See who's in ${classroom?.className} class! This page lists all students enrolled in this course. `,
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
