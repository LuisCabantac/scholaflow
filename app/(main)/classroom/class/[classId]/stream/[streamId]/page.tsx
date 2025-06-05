import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { getClassStreamByStreamId } from "@/lib/stream-service";
import { getClassworkByClassAndUserId } from "@/lib/classwork-service";
import { getAllClassTopicsByClassId } from "@/lib/class-topic-service";
import {
  getAllCommentsByStreamId,
  getAllPrivateCommentsByStreamId,
} from "@/lib/comment-service";
import {
  getAllEnrolledClassesByClassId,
  getClassByClassId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/classroom-service";

import StreamDetailSection from "@/components/StreamDetailSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ streamId: string }>;
}): Promise<Metadata> {
  const { streamId } = await params;

  const stream = await getClassStreamByStreamId(streamId);

  return {
    title: stream?.title || stream?.content,
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

  if (session.user.role === "admin") return redirect("/classroom");

  const stream = await getClassStreamByStreamId(streamId);
  if (!stream) return redirect("/classroom");

  const classroom = await getClassByClassId(stream.classId);
  if (!classroom) return redirect("/classroom");

  const enrolledClass = await getEnrolledClassByClassAndSessionId(
    session.user.id,
    stream.classId,
  );
  if (!enrolledClass && classroom?.teacherId !== session.user.id)
    return redirect("/classroom");

  if (
    stream.scheduledAt &&
    new Date(stream.scheduledAt) > new Date() &&
    classroom?.teacherId !== session.user.id
  )
    return redirect("/classroom");

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
    classroom?.id ?? "",
    stream?.id ?? "",
  );

  const enrolledClasses = await getAllEnrolledClassesByClassId(stream.classId);

  const allTopics = await getAllClassTopicsByClassId(stream.classId);

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

  return redirect(`/classroom/class/${classroom.id}`);
}
