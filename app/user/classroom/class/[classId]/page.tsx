import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import {
  getClassByClassId,
  getAllCommentsByStreamId,
  getAllClassStreamsByClassId,
  getAllEnrolledClassesByClassId,
  getEnrolledClassByClassAndSessionId,
  getAllClassTopicsByClassId,
} from "@/lib/data-service";
import { deleteClass } from "@/lib/classroom-actions";

import StreamsSection from "@/components/StreamsSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ classId: string }>;
}): Promise<Metadata> {
  const { classId } = await params;

  const classroom = await getClassByClassId(classId);

  return {
    title: classroom?.className,
    description:
      classroom?.classDescription || `${classroom?.className} class.`,
  };
}

export interface IStream {
  id: string;
  author: string;
  authorName: string;
  avatar: string;
  caption: string;
  announceTo: string[];
  attachment: string[];
  links: string[];
  announceToAll: boolean;
  classroomId: string;
  classroomName: string;
  created_at: string;
  updatedPost: boolean;
  type: "stream" | "assignment" | "quiz" | "question" | "material";
  scheduledAt: string | null;
  topicId: string | null;
  topicName: string | null;
  title: string;
  dueDate: string | null;
  points: number | null;
  acceptingSubmissions: boolean;
  closeSubmissionsAfterDueDate: boolean;
}

export interface IStreamComment {
  id: string;
  streamId: string;
  classroomId: string;
  comment: string;
  author: string;
  authorName: string;
  authorAvatar: string;
  created_at: string;
  updatedComment: boolean;
  toUserId: string;
  attachment: string[];
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

  if (session.user.role === "admin") return redirect("/user/classroom");

  const classroom = await getClassByClassId(classId);
  if (!classroom) return redirect("/user/classroom");

  const isTeacher = classroom.teacherId === session.user.id;
  const isEnrolled =
    (await getEnrolledClassByClassAndSessionId(classId)) !== null;

  if (!isTeacher && !isEnrolled) return redirect("/user/classroom");

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
      session={session}
      classroom={classroom}
      enrolledClasses={enrolledClasses}
      onDeleteClass={handleDeleteClassByClassId}
      onGetAllComments={handleGetAllCommentsByStreamId}
      onGetAllClassStreams={handleGetAllClassStreams}
    />
  );
}
