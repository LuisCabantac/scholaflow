import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

import { streamQueries } from "@/queries/stream";
import { classroomQueries } from "@/queries/classroom";
import { classworkQueries } from "@/queries/classwork";
import { classTopicQueries } from "@/queries/class-topic";

import StreamDetailSection from "@/components/stream/StreamDetailSection";

export const Route = createFileRoute(
  "/_main/classroom/class/$classId_/stream/$streamId/",
)({
  component: StreamDetailPage,
});

function StreamDetailPage() {
  const { streamId } = Route.useParams();
  const {
    user,
    isTeacher,
    classroom: guardedClassroom,
  } = Route.useRouteContext();
  const { data: stream } = useSuspenseQuery(streamQueries.byId(streamId));
  const { data: classroom } = useSuspenseQuery(
    classroomQueries.byId(guardedClassroom.id),
  );
  const { data: topics } = useSuspenseQuery(
    classTopicQueries.byClass(guardedClassroom.id),
  );
  const { data: enrolledClasses } = useSuspenseQuery(
    classroomQueries.enrolledByClass(guardedClassroom.id),
  );
  const { data: classwork } = useQuery({
    ...classworkQueries.byStreamAndUser(user.id, guardedClassroom.id, streamId),
    enabled: !isTeacher,
  });

  if (!stream || !classroom) return null;

  return (
    <StreamDetailSection
      stream={stream}
      classroom={classroom}
      user={user}
      topics={topics}
      enrolledClasses={enrolledClasses}
      classwork={isTeacher ? null : (classwork ?? null)}
    />
  );
}
