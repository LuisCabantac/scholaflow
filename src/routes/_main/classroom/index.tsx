import { z } from "zod";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { streamQueries } from "@/queries/stream";
import { classroomQueries } from "@/queries/classroom";
import { classworkQueries } from "@/queries/classwork";

import ClassroomSection from "@/components/classroom/ClassroomSection";

export const Route = createFileRoute("/_main/classroom/")({
  validateSearch: z.object({
    sort: z
      .enum(["all-classes", "created-classes", "enrolled-classes"])
      .optional()
      .catch(undefined),
  }),
  beforeLoad: ({ context }) => {
    if (context.user.role === "admin") throw redirect({ to: "/" });
  },
  loader: async ({ context: { queryClient, user } }) => {
    await Promise.all([
      queryClient.ensureQueryData(classroomQueries.byTeacher(user.id)),
      queryClient.ensureQueryData(classroomQueries.enrolledByUser(user.id)),
      queryClient.ensureQueryData(classworkQueries.byUser(user.id)),
      queryClient.ensureQueryData(streamQueries.enrolledClassworks(user.id)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Classroom | ScholaFlow" },
      {
        name: "description",
        content:
          "Your learning hub. Access all your enrolled classes from here. Quickly jump into coursework, connect with classmates, and manage your learning journey.",
      },
    ],
  }),
  component: ClassroomPage,
});

function ClassroomPage() {
  const { user } = Route.useRouteContext();
  const { sort } = Route.useSearch();

  return <ClassroomSection user={user} sort={sort ?? "all-classes"} />;
}
