import { redirect } from "next/navigation";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import {
  getAllCommentsByStreamId,
  getAllEnrolledClassesByClassId,
  getAllPrivateCommentsByStreamId,
  getClassByClassId,
  getClassStreamByStreamId,
  getClassworkByClassAndUserId,
  getEnrolledClassByClassAndSessionId,
} from "@/lib/data-service";

import StreamDetailSection from "@/components/StreamDetailSection";

export default async function Page({ params }: { params: Params }) {
  const { streamId } = params;

  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  if (session.user.role === "admin") return redirect("/user/classroom");

  const stream = await getClassStreamByStreamId(streamId);

  if (!stream) return redirect("/user/classroom");

  const enrolledClass = await getEnrolledClassByClassAndSessionId(
    stream.classroomId,
  );
  const classroom = await getClassByClassId(stream.classroomId);
  if (!classroom) return redirect("/user/classroom");
  if (!enrolledClass && classroom?.teacherId !== session.user.id)
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

  if (
    session.user.id === classroom.teacherId ||
    (stream.announceTo.includes(session.user.id) &&
      stream.announceToAll === false) ||
    stream.announceToAll
  )
    return (
      <StreamDetailSection
        stream={stream}
        session={session}
        classroom={classroom}
        classwork={classwork}
        enrolledClasses={enrolledClasses}
        onGetAllComments={handleGetAllCommentsByStreamId}
        onGetAllPrivateComments={handleGetAllPrivateComments}
      />
    );

  return redirect(`/user/classroom/class/${classroom.classroomId}`);
}
