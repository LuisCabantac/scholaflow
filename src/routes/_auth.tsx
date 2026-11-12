import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { authQueries } from "@/queries/auth";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData({
      ...authQueries.session(),
      revalidateIfStale: true,
    });

    if (session) throw redirect({ to: "/classroom" });
  },
  component: Outlet,
});
