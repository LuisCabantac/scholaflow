import { createFileRoute, redirect } from "@tanstack/react-router";

import { getSession } from "@/server/functions/auth";

export const Route = createFileRoute("/_auth/sign-up")({
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (session) {
      throw redirect({
        to: "/classroom",
        search: { redirect: location.href },
      });
    }

    return;
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_auth/sign-up"!</div>;
}
