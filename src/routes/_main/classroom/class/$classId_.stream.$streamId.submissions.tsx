import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_main/classroom/class/$classId_/stream/$streamId/submissions",
)({
  component: () => null,
});
