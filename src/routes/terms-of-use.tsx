import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-use")({
  beforeLoad: ({ location }) => {
    throw redirect({ href: `/terms${location.searchStr}`, statusCode: 301 });
  },
  component: () => null,
});
