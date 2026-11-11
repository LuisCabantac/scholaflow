import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  beforeLoad: ({ location }) => {
    throw redirect({ href: `/sign-up${location.searchStr}`, statusCode: 301 });
  },
  component: () => null,
});
