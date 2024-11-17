import { redirect } from "next/navigation";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";
import {
  getAllAssignedClassworksByStreamAndClassroomId,
  getAllEnrolledClassesByClassAndSessionId,
  getAllPrivateCommentsByStreamId,
  getClassByClassId,
  getClassStreamByStreamId,
  getClassworkByClassAndUserId,
} from "@/lib/data-service";

import StreamSubmissionsSection from "@/components/StreamSubmissionsSection";

export default async function Page({ params }: { params: Params }) {
  const { streamId } = params;

  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

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

  const turnedInUsers = await getAllAssignedClassworksByStreamAndClassroomId(
    classroom?.classroomId ?? "",
    streamId,
  );

  const enrolledUsers = await getAllEnrolledClassesByClassAndSessionId(
    classroom?.classroomId,
  );

  return (
    <StreamSubmissionsSection
      stream={stream}
      session={session}
      classroom={classroom}
      turnedInUsers={turnedInUsers}
      enrolledUsers={enrolledUsers}
      onGetAssignedUserClasswork={getAssignedUserClasswork}
      onGetAllPrivateComments={handleGetAllPrivateComments}
    />
  );
}
