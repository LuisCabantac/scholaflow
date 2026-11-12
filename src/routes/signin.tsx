import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/signin")({
  beforeLoad: ({ location }) => {
    throw redirect({ href: `/sign-in${location.searchStr}`, statusCode: 301 });
  },
  component: () => null,
});
