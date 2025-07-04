import { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { deleteClass } from "@/lib/classroom-actions";
import { getAllClassworksByUserId } from "@/lib/classwork-service";
import { getAllEnrolledClassesClassworks } from "@/lib/stream-service";
import {
  getClassByClassCode,
  getAllClassesByTeacherId,
  getAllEnrolledClassesByUserId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/classroom-service";

import ClassroomSection from "@/components/ClassroomSection";

export const metadata: Metadata = {
  title: "Classroom",
  description:
    "Your learning hub. Access all your enrolled classes from here. Quickly jump into coursework, connect with classmates, and manage your learning journey.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/");

  async function handleGetAllClassesByTeacher(id: string) {
    "use server";

    const data = await getAllClassesByTeacherId(id);
    return data;
  }

  async function handleGetAllEnrolledClassesByUserId(id: string) {
    "use server";
    const data = await getAllEnrolledClassesByUserId(id);
    return data;
  }

  async function handleGetClassByClassCode(code: string) {
    "use server";
    const data = await getClassByClassCode(code);
    return data;
  }

  async function handleGetEnrolledClassByClassAndSessionId(classId: string) {
    "use server";

    if (!session) return null;

    const data = await getEnrolledClassByClassAndSessionId(
      session.user.id,
      classId,
    );
    return data;
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
      session={session.user}
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
