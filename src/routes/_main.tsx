import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authQueries } from "@/queries/auth";
import { classroomQueries } from "@/queries/classroom";
import { notificationQueries } from "@/queries/notification";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export const Route = createFileRoute("/_main")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData({
      ...authQueries.session(),
      revalidateIfStale: true,
    });

    if (!session) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.href },
      });
    }

    return { user: session.user };
  },
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  loader: async ({ context: { queryClient, user } }) => {
    await Promise.all([
      queryClient.ensureQueryData(classroomQueries.byTeacher(user.id)),
      queryClient.ensureQueryData(classroomQueries.enrolledByUser(user.id)),
      queryClient.ensureQueryData(notificationQueries.unreadByUser(user.id)),
    ]);

    return { renderedAt: Date.now() };
  },
  component: MainLayout,
});

function MainLayout() {
  const { user } = Route.useRouteContext();

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar user={user} />
      <main className="h-full w-full overflow-auto">
        <Header user={user} />
        <div className="px-4 pb-4 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
