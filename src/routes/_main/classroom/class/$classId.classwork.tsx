import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { streamQueries } from "@/queries/stream";
import { classroomQueries } from "@/queries/classroom";

import ClassworksSection from "@/components/classwork/ClassworksSection";

export const Route = createFileRoute(
  "/_main/classroom/class/$classId/classwork",
)({
  loader: async ({ context: { queryClient }, params: { classId } }) => {
    await queryClient.ensureQueryData(
      streamQueries.classworksByClass(classId, ""),
    );
  },
  head: ({ match }) => ({
    meta: [
      { title: `Classwork - ${match.context.classroom.name} | ScholaFlow` },
      {
        name: "description",
        content: `Access all classwork for ${match.context.classroom.name}. View assignments, deadlines, and relevant materials. Stay organized and keep track of everything you need to succeed in this class.`,
      },
    ],
  }),
  component: ClassworkPage,
});

function ClassworkPage() {
  const { classId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: classroom } = useSuspenseQuery(classroomQueries.byId(classId));

  if (!classroom) return null;

  return <ClassworksSection classroom={classroom} user={user} />;
}
