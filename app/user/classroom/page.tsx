import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

import {
  getClassByClassCode,
  getAllClassesByTeacherId,
  getEnrolledClassByClassAndSessionId,
  getAllEnrolledClassesByUserId,
  getAllEnrolledClassesClassworks,
  getAllClassworksByUserId,
} from "@/lib/data-service";
import { deleteClass } from "@/lib/classroom-actions";

import ClassroomSection from "@/components/ClassroomSection";

export const metadata: Metadata = {
  title: "Classroom",
  description:
    "Your learning hub. Access all your enrolled classes from here. Quickly jump into coursework, connect with classmates, and manage your learning journey.",
};

export default async function Page() {
  const session = await auth();
  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/");

  async function handleGetAllClassesByTeacher(id: string) {
    "use server";
    if (hasUser(session) && session.user.role === "teacher") {
      const data = await getAllClassesByTeacherId(id);
      return data;
    } else return null;
  }

  async function handleGetAllEnrolledClassesByUserId(id: string) {
    "use server";
    if (
      hasUser(session) &&
      (session.user.role === "teacher" || session.user.role === "student")
    ) {
      const data = await getAllEnrolledClassesByUserId(id);
      return data;
    } else return null;
  }

  async function handleGetClassByClassCode(code: string) {
    "use server";
    if (
      hasUser(session) &&
      (session.user.role === "teacher" || session.user.role === "student")
    ) {
      const data = await getClassByClassCode(code);
      return data;
    } else return null;
  }

  async function handleGetEnrolledClassByClassAndSessionId(classId: string) {
    "use server";
    if (
      hasUser(session) &&
      (session.user.role === "teacher" || session.user.role === "student")
    ) {
      const data = await getEnrolledClassByClassAndSessionId(classId);
      return data;
    } else return null;
  }

  async function handleDeleteClassByClassId(classId: string) {
    "use server";
    await deleteClass(classId);
  }

  async function handleGetAllEnrolledClassesClassworks(userId: string) {
    "use server";
    const data = await getAllEnrolledClassesClassworks(userId);
    return data;
  }

  async function handleGetAllClassworks(userId: string) {
    "use server";
    const data = await getAllClassworksByUserId(userId);
    return data;
  }

  return (
    <ClassroomSection
      role={session.user.role}
      session={session}
      onGetClass={handleGetClassByClassCode}
      onDeleteClass={handleDeleteClassByClassId}
      onGetAllClasses={handleGetAllClassesByTeacher}
      onGetAllClassworks={handleGetAllClassworks}
      onGetEnrolledClass={handleGetEnrolledClassByClassAndSessionId}
      onGetAllEnrolledClasses={handleGetAllEnrolledClassesByUserId}
      onGetAllEnrolledClassesClassworks={handleGetAllEnrolledClassesClassworks}
    />
  );
}
