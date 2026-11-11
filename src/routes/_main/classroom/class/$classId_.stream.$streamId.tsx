import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { streamQueries } from "@/queries/stream";
import { commentQueries } from "@/queries/comment";
import { classroomQueries } from "@/queries/classroom";
import { classworkQueries } from "@/queries/classwork";
import { classTopicQueries } from "@/queries/class-topic";

import StreamDetailLoading from "@/components/stream/StreamDetailLoading";

export const Route = createFileRoute(
  "/_main/classroom/class/$classId_/stream/$streamId",
)({
  beforeLoad: async ({ context, params: { classId, streamId } }) => {
    if (context.user.role === "admin") throw redirect({ to: "/classroom" });

    const stream = await context.queryClient.fetchQuery({
      ...streamQueries.byId(streamId),
      staleTime: 0,
    });
    if (!stream) throw redirect({ to: "/classroom" });
    if (stream.classId !== classId) {
      throw redirect({
        to: "/classroom/class/$classId/stream/$streamId",
        params: { classId: stream.classId, streamId },
      });
    }

    const classroom = await context.queryClient.fetchQuery({
      ...classroomQueries.byId(stream.classId),
      staleTime: 0,
    });
    if (!classroom) throw redirect({ to: "/classroom" });

    return {
      stream,
      classroom,
      isTeacher: classroom.teacherId === context.user.id,
    };
  },
  loader: async ({ context, params: { streamId } }) => {
    const { queryClient, stream, user, isTeacher } = context;
    await Promise.all([
      queryClient.ensureQueryData(
        classroomQueries.enrolledByClass(stream.classId),
      ),
      queryClient.ensureQueryData(classTopicQueries.byClass(stream.classId)),
      queryClient.ensureQueryData(commentQueries.byStream(streamId)),
      ...(isTeacher
        ? []
        : [
            queryClient.ensureQueryData(
              classworkQueries.byStreamAndUser(
                user.id,
                stream.classId,
                streamId,
              ),
            ),
            queryClient.ensureQueryData(
              commentQueries.privateByStream(streamId),
            ),
          ]),
    ]);
  },
  head: ({ match }) => ({
    meta: [
      {
        title: `${match.context.stream.title || match.context.stream.content || ""} | ScholaFlow`,
      },
    ],
  }),
  pendingComponent: StreamDetailLoading,
  component: Outlet,
});
