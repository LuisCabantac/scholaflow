import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import {
  getAllClassTopicsByClassId,
  getAllCommentsByStreamId,
  getAllEnrolledClassesByClassId,
  getAllPrivateCommentsByStreamId,
  getClassByClassId,
  getClassStreamByStreamId,
  getClassworkByClassAndUserId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/data-service";

import StreamDetailSection from "@/components/StreamDetailSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ streamId: string }>;
}): Promise<Metadata> {
  const { streamId } = await params;

  const stream = await getClassStreamByStreamId(streamId);

  return {
    title: stream?.title || stream?.caption,
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

  if (session.user.role === "admin") return redirect("/user/classroom");

  const stream = await getClassStreamByStreamId(streamId);
  if (!stream) return redirect("/user/classroom");

  const classroom = await getClassByClassId(stream.classroomId);
  if (!classroom) return redirect("/user/classroom");

  const enrolledClass = await getEnrolledClassByClassAndSessionId(
    stream.classroomId,
  );
  if (!enrolledClass && classroom?.teacherId !== session.user.id)
    return redirect("/user/classroom");

  if (
    stream.scheduledAt &&
    new Date(stream.scheduledAt) > new Date() &&
    classroom?.teacherId !== session.user.id
  )
    return redirect("/user/classroom");

  async function handleGetAllCommentsByStreamId(streamId: string) {
    "use server";
    const comments = await getAllCommentsByStreamId(streamId);
    return comments;
  }

  async function handleGetAllPrivateComments(streamId: string) {
    "use server";
    const privateComments = await getAllPrivateCommentsByStreamId(streamId);
    return privateComments;
  }

  const classwork = await getClassworkByClassAndUserId(
    session?.user?.id ?? "",
    classroom?.classroomId ?? "",
    stream?.id ?? "",
  );

  const enrolledClasses = await getAllEnrolledClassesByClassId(
    stream.classroomId,
  );

  const allTopics = await getAllClassTopicsByClassId(stream.classroomId);

  if (
    session.user.id === classroom.teacherId ||
    (stream.announceTo.includes(session.user.id) &&
      stream.announceToAll === false) ||
    stream.announceToAll
  )
    return (
      <StreamDetailSection
        topics={allTopics}
        stream={stream}
        session={session.user}
        classroom={classroom}
        classwork={classwork}
        enrolledClasses={enrolledClasses}
        onGetAllComments={handleGetAllCommentsByStreamId}
        onGetAllPrivateComments={handleGetAllPrivateComments}
      />
    );

  return redirect(`/user/classroom/class/${classroom.classroomId}`);
}
