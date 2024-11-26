import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import {
  getClassByClassId,
  getAllCommentsByStreamId,
  getAllClassStreamsByClassId,
  getAllEnrolledClassesByClassId,
  getEnrolledClassByClassAndSessionId,
  getAllClassTopicsByClassId,
} from "@/lib/data-service";

import StreamsSection from "@/components/StreamsSection";
import { deleteClass } from "@/lib/classroom-actions";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { classId } = params;

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

export default async function Page({ params }: { params: Params }) {
  const { classId } = params;
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/user/classroom");

  const enrolledClass = await getEnrolledClassByClassAndSessionId(classId);
  const classroom = await getClassByClassId(classId);
  if (!classroom) return redirect("/user/classroom");
  if (!enrolledClass && classroom?.teacherId !== session.user.id)
    return redirect("/user/classroom");

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
