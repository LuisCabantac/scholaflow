import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { streamQueries } from "@/queries/stream";
import { commentQueries } from "@/queries/comment";
import { classroomQueries } from "@/queries/classroom";
import { classworkQueries } from "@/queries/classwork";

import SubmissionsSection from "@/components/classwork/SubmissionsSection";

export const Route = createFileRoute(
  "/_main/classroom/class/$classId_/stream/$streamId/submissions",
)({
  validateSearch: z
    .object({ name: z.string().optional(), user: z.string().optional() })
    .catch({}),
  beforeLoad: ({ context }) => {
    if (!context.isTeacher) throw redirect({ to: "/classroom" });
  },
  loaderDeps: ({ search: { user } }) => ({ user }),
  loader: async ({ context, params: { streamId }, deps: { user } }) => {
    const { queryClient, stream } = context;
    await Promise.all([
      queryClient.ensureQueryData(
        classroomQueries.enrolledByClass(stream.classId),
      ),
      queryClient.ensureQueryData(
        classworkQueries.assignedByStream(stream.classId, streamId),
      ),
      queryClient.ensureQueryData(commentQueries.privateByStream(streamId)),
      ...(user
        ? [
            queryClient.ensureQueryData(
              classworkQueries.byStreamAndUser(user, stream.classId, streamId),
            ),
          ]
        : []),
    ]);
  },
  head: ({ match }) => ({
    meta: [
      {
        title: `${match.context.stream.title || match.context.stream.content || ""} - Submissions | ScholaFlow`,
      },
    ],
  }),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const { streamId } = Route.useParams();
  const { name, user: selectedUserId } = Route.useSearch();
  const { user, classroom: guardedClassroom } = Route.useRouteContext();
  const { data: stream } = useSuspenseQuery(streamQueries.byId(streamId));
  const { data: classroom } = useSuspenseQuery(
    classroomQueries.byId(guardedClassroom.id),
  );

  if (!stream || !classroom) return null;

  return (
    <SubmissionsSection
      stream={stream}
      classroom={classroom}
      user={user}
      selectedUserId={selectedUserId}
      selectedName={name}
    />
  );
}
