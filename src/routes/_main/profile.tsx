import { createFileRoute, redirect } from "@tanstack/react-router";

import { getSession } from "@/server/functions/auth";

export const Route = createFileRoute("/_main/profile")({
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: "/sign-in",
        search: { redirect: location.href },
      });
    }

    return { user: session.user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/ _main/profile"!</div>;
}
