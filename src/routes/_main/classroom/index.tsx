import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/classroom/")({
  beforeLoad: ({ context }) => {
    if (context.user.role === "admin") throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  return <div>Hello {user.name}</div>;
}
