import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { classroomQueries } from "@/queries/classroom";

import PeopleLoading from "@/components/people/PeopleLoading";
import PeopleSection from "@/components/people/PeopleSection";

export const Route = createFileRoute("/_main/classroom/class/$classId/people")({
  loader: async ({ context: { queryClient }, params: { classId } }) => {
    await queryClient.ensureQueryData(
      classroomQueries.enrolledByClass(classId),
    );
  },
  head: ({ match }) => ({
    meta: [
      { title: `People - ${match.context.classroom.name} | ScholaFlow` },
      {
        name: "description",
        content: `See who's in ${match.context.classroom.name} class! This page lists all students enrolled in this course.`,
      },
    ],
  }),
  pendingComponent: PeopleLoading,
  component: PeoplePage,
});

function PeoplePage() {
  const { classId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: classroom } = useSuspenseQuery(classroomQueries.byId(classId));

  if (!classroom) return null;

  return <PeopleSection classroom={classroom} user={user} />;
}
