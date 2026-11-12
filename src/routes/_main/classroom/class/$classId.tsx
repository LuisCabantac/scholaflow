import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { classroomQueries } from "@/queries/classroom";
import { classTopicQueries } from "@/queries/class-topic";

import ClassTabs from "@/components/classroom/ClassTabs";

export const Route = createFileRoute("/_main/classroom/class/$classId")({
  beforeLoad: async ({ context, params: { classId } }) => {
    if (context.user.role === "admin") throw redirect({ to: "/classroom" });

    const classroom = await context.queryClient.fetchQuery({
      ...classroomQueries.byId(classId),
      staleTime: 0,
    });
    if (!classroom) throw redirect({ to: "/classroom" });

    const isTeacher = classroom.teacherId === context.user.id;
    if (!isTeacher) {
      const enrolled = await context.queryClient.fetchQuery({
        ...classroomQueries.enrolledByClassAndSession(context.user.id, classId),
        staleTime: 0,
      });
      if (!enrolled) throw redirect({ to: "/classroom" });
    }

    return { classroom, isTeacher };
  },
  loader: async ({ context: { queryClient }, params: { classId } }) => {
    await Promise.all([
      queryClient.ensureQueryData(classroomQueries.enrolledByClass(classId)),
      queryClient.ensureQueryData(classTopicQueries.byClass(classId)),
    ]);
  },
  head: ({ match }) => ({
    meta: [
      { title: `${match.context.classroom.name} | ScholaFlow` },
      {
        name: "description",
        content:
          match.context.classroom.description ||
          `${match.context.classroom.name} class.`,
      },
    ],
  }),
  component: ClassLayout,
});

function ClassLayout() {
  const { classId } = Route.useParams();

  return (
    <>
      <ClassTabs classId={classId} />
      <Outlet />
    </>
  );
}
