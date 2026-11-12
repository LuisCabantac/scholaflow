import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { streamQueries } from "@/queries/stream";
import { classroomQueries } from "@/queries/classroom";

import StreamsSection from "@/components/stream/StreamsSection";

export const Route = createFileRoute("/_main/classroom/class/$classId/")({
  validateSearch: z.object({
    sort: z
      .enum(["all", "stream", "assignment", "quiz", "question", "material"])
      .optional()
      .catch(undefined),
  }),
  loader: async ({ context: { queryClient }, params: { classId } }) => {
    await queryClient.ensureQueryData(streamQueries.byClass(classId));
  },
  component: ClassStreamPage,
});

function ClassStreamPage() {
  const { sort } = Route.useSearch();
  const { classId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { data: classroom } = useSuspenseQuery(classroomQueries.byId(classId));

  if (!classroom) return null;

  return (
    <StreamsSection classroom={classroom} user={user} sort={sort ?? "all"} />
  );
}
