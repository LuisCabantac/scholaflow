import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { deleteClass } from "@/lib/classroom-actions";
import { getAllCommentsByStreamId } from "@/lib/comment-service";
import { getAllClassStreamsByClassId } from "@/lib/stream-service";
import { getAllClassTopicsByClassId } from "@/lib/class-topic-service";
import {
  getClassByClassId,
  getAllEnrolledClassesByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/classroom-service";

import StreamsSection from "@/components/StreamsSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classId: string }>;
}): Promise<Metadata> {
  const { classId } = await params;

  const classroom = await getClassByClassId(classId);

  return {
    title: classroom?.name,
    description: classroom?.description || `${classroom?.name} class.`,
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

  if (!classId) return redirect("/classroom");

  if (!session) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/classroom");

  const classroom = await getClassByClassId(classId);
  if (!classroom) return redirect("/classroom");

  const isTeacher = classroom.teacherId === session.user.id;
  const isEnrolled =
    (await getEnrolledClassByClassAndSessionId(session.user.id, classId)) !==
    null;

  if (!isTeacher && !isEnrolled) return redirect("/classroom");

  async function handleGetAllClassStreams(classId: string) {
    "use server";
    const streams = await getAllClassStreamsByClassId(classId);
    return streams;
  }

  async function handleGetAllCommentsByStreamId(stream: string) {
    "use server";
    const comments = await getAllCommentsByStreamId(stream);
    return comments;
  }

  async function handleDeleteClassByClassId(classId: string) {
    "use server";
    await deleteClass(classId);
  }

  const enrolledClasses = await getAllEnrolledClassesByClassId(classId);

  const allTopics = await getAllClassTopicsByClassId(classId);

  return (
    <StreamsSection
      topics={allTopics}
      session={session.user}
      classroom={classroom}
      enrolledClasses={enrolledClasses}
      onDeleteClass={handleDeleteClassByClassId}
      onGetAllComments={handleGetAllCommentsByStreamId}
      onGetAllClassStreams={handleGetAllClassStreams}
    />
  );
}
