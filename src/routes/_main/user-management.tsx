import { z } from "zod";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { userQueries } from "@/queries/user";
import { userManagementQueries } from "@/queries/user-management";

import UserManagementLoading from "@/components/user-management/UserManagementLoading";
import UserManagementSection from "@/components/user-management/UserManagementSection";

export const Route = createFileRoute("/_main/user-management")({
  validateSearch: z.object({
    sort: z.enum(["pending", "rejected"]).optional().catch(undefined),
  }),
  beforeLoad: ({ context }) => {
    if (context.user.role !== "admin") throw redirect({ to: "/classroom" });
  },
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(userQueries.list()),
      queryClient.ensureQueryData(userManagementQueries.roleRequests()),
    ]);
  },
  head: () => ({
    meta: [
      { title: "User Management | ScholaFlow" },
      {
        name: "description",
        content:
          "Manage user accounts and permissions. This administrative area allows for control over user access and roles within the platform.",
      },
    ],
  }),
  pendingComponent: UserManagementLoading,
  component: UserManagementPage,
});

function UserManagementPage() {
  const { user } = Route.useRouteContext();
  const { sort } = Route.useSearch();

  return <UserManagementSection user={user} sort={sort} />;
}
