import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

import { notificationQueries } from "@/queries/notification";

import NotificationsLoading from "@/components/notifications/NotificationsLoading";
import NotificationsSection from "@/components/notifications/NotificationsSection";

export const Route = createFileRoute("/_main/notifications")({
  validateSearch: z.object({
    sort: z.enum(["all", "unread"]).optional().catch(undefined),
  }),
  loader: async ({ context: { queryClient, user } }) => {
    await queryClient.ensureQueryData(notificationQueries.byUser(user.id));
  },
  head: () => ({
    meta: [
      { title: "Notifications | ScholaFlow" },
      {
        name: "description",
        content:
          "View and manage your notifications. Stay updated with important alerts, messages, and system updates in one centralized location.",
      },
    ],
  }),
  pendingComponent: NotificationsLoading,
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = Route.useRouteContext();
  const { sort } = Route.useSearch();

  return <NotificationsSection user={user} sort={sort ?? "all"} />;
}
