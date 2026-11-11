import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/classroom/class/$classId")({
  component: Outlet,
});
