import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import {
  getAllAssignedClassworksByStreamAndClassroomId,
  getAllEnrolledClassesByClassAndSessionId,
  getAllPrivateCommentsByStreamId,
  getClassByClassId,
  getClassStreamByStreamId,
  getClassworkByClassAndUserId,
} from "@/lib/data-service";

import StreamSubmissionsSection from "@/components/StreamSubmissionsSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ streamId: string }>;
}): Promise<Metadata> {
  const { streamId } = await params;

  const stream = await getClassStreamByStreamId(streamId);

  return {
    title:
      `${stream?.title} - Submissions` || `${stream?.caption} - Submissions`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const { streamId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/");

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) return redirect("/user/classroom");

  const classroom = await getClassByClassId(stream.classroomId);
  if (!classroom) return redirect("/user/classroom");
  if (classroom?.teacherId !== session.user.id)
    return redirect("/user/classroom");

  async function getAssignedUserClasswork(
    userId: string,
    classId: string,
    streamId: string,
  ) {
    "use server";
    const classwork = await getClassworkByClassAndUserId(
      userId,
      classId,
      streamId,
    );
    return classwork;
  }

  async function handleGetAllPrivateComments(streamId: string) {
    "use server";
    const privateComments = await getAllPrivateCommentsByStreamId(streamId);
    return privateComments;
  }

  async function handleGetAllAssignedClassworks(
    classId: string,
    streamId: string,
  ) {
    "use server";
    const turnedInUsers = await getAllAssignedClassworksByStreamAndClassroomId(
      classId,
      streamId,
    );
    return turnedInUsers;
  }

  async function handleGetAllEnrolledUsers(classId: string) {
    "use server";
    const enrolledUsers =
      await getAllEnrolledClassesByClassAndSessionId(classId);
    return enrolledUsers;
  }

  return (
    <StreamSubmissionsSection
      stream={stream}
      session={session}
      classroom={classroom}
      onGetAssignedUserClasswork={getAssignedUserClasswork}
      onGetAllPrivateComments={handleGetAllPrivateComments}
      onGetAllAssignedClassworks={handleGetAllAssignedClassworks}
      onGetAllEnrolledUsers={handleGetAllEnrolledUsers}
    />
  );
}
