import { z } from "zod";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { streamQueries } from "@/queries/stream";
import { classroomQueries } from "@/queries/classroom";
import { classworkQueries } from "@/queries/classwork";

import ToDoLoading from "@/components/todo/ToDoLoading";
import ToDoSection from "@/components/todo/ToDoSection";

export const Route = createFileRoute("/_main/to-do")({
  validateSearch: z.object({
    filter: z.enum(["assigned", "missing", "done"]).optional().catch(undefined),
  }),
  beforeLoad: ({ context }) => {
    if (context.user.role === "admin") throw redirect({ to: "/" });
  },
  loader: async ({ context: { queryClient, user } }) => {
    await Promise.all([
      queryClient.ensureQueryData(classworkQueries.byUser(user.id)),
      queryClient.ensureQueryData(streamQueries.enrolledClassworks(user.id)),
      queryClient.ensureQueryData(classroomQueries.enrolledByUser(user.id)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "To-do | ScholaFlow" },
      {
        name: "description",
        content:
          "Manage your classwork effectively with this comprehensive to-do list. View all your assigned, missing, and completed tasks in one organized place. Stay on top of your studies and track your progress effortlessly.",
      },
    ],
  }),
  pendingComponent: ToDoLoading,
  component: ToDoPage,
});

function ToDoPage() {
  const { user } = Route.useRouteContext();
  const { filter } = Route.useSearch();

  return <ToDoSection user={user} filter={filter ?? "assigned"} />;
}
