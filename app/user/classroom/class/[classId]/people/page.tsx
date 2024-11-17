import { redirect } from "next/navigation";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

import { auth } from "@/lib/auth";
import {
  getAllEnrolledClassesByClassId,
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/data-service";
import { deleteEnrolledClassbyClassAndEnrolledClassId } from "@/lib/classroom-actions";
import { hasUser } from "@/lib/utils";

import ClassPeopleSection from "@/components/ClassPeopleSection";

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
    <ClassPeopleSection
      classId={classId}
      sessionId={session.user.id}
      classroom={classroom}
      onDeleteClass={handleDeleteClassByClassId}
      onGetAllEnrolledClasses={handleGetAllEnrolledClassesByClassId}
    />
  );
}
