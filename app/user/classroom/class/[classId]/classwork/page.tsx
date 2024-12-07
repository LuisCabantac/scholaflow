import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import {
  getAllClassTopicsByClassId,
  getAllClassworkStreamsByClassId,
  getAllCommentsByStreamId,
  getAllEnrolledClassesByClassId,
  getClassByClassId,
  getClassworksByClassIdQuery,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/data-service";

import ClassworksSection from "@/components/ClassworksSection";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { classId } = params;

  const classroom = await getClassByClassId(classId);

  return {
    title: `Classwork - ${classroom?.className}`,
    description: `Access all classwork for ${classroom?.className}. View assignments, deadlines, and relevant materials. Stay organized and keep track of everything you need to succeed in this class.`,
  };
}

export interface IClasswork {
  id: string;
  userId: string;
  userName: string;
  streamId: string;
  classroomId: string;
  classroomName: string;
  streamCreated: string;
  classworkTitle: string;
  attachment: string[];
  title: string;
  userPoints: string;
  isReturned: boolean;
  isTurnedIn: boolean;
  isGraded: boolean;
  links: string[];
  userAvatar: string;
  turnedInDate: string;
}

export default async function Page({ params }: { params: Params }) {
  const { classId } = params;
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/user/classroom");

  const classroom = await getClassByClassId(classId);
  if (!classroom) return redirect("/user/classroom");

  const isTeacher = classroom.teacherId === session.user.id;
  const isEnrolled =
    (await getEnrolledClassByClassAndSessionId(classId)) !== null;

  if (!isTeacher && !isEnrolled) return redirect("/user/classroom");

  async function handleGetAllClassworkStreamsByClassId(
    classId: string,
    query: string,
  ) {
    "use server";
    if (!query) {
      const classworks = await getAllClassworkStreamsByClassId(classId);
      return classworks;
    }
    const classworks = await getClassworksByClassIdQuery(classId, query);
    return classworks;
  }

  async function handleGetAllCommentsByStreamId(stream: string) {
    "use server";
    const comments = await getAllCommentsByStreamId(stream);
    return comments;
  }

  const enrolledClasses = await getAllEnrolledClassesByClassId(classId);

  async function handleGetAllClassTopicsByClassId(classId: string) {
    "use server";
    const topics = await getAllClassTopicsByClassId(classId);
    return topics;
  }

  return (
    <ClassworksSection
      session={session}
      classroom={classroom}
      enrolledClasses={enrolledClasses}
      onGetAllComments={handleGetAllCommentsByStreamId}
      onGetAllTopics={handleGetAllClassTopicsByClassId}
      onGetAllClassworkStreams={handleGetAllClassworkStreamsByClassId}
    />
  );
}
