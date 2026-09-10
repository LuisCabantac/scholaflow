import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Notification } from "@/lib/schema";
import NotificationsSection from "@/components/NotificationsSection";
import { getAllNotificationByUserId } from "@/lib/notification-service";

export const metadata: Metadata = {
  title: "Notifications",
  description:
    "View and manage your notifications. Stay updated with important alerts, messages, and system updates in one centralized location.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return redirect("/signin");

  async function handleGetAllNotificationByUserId(
    userId: string,
  ): Promise<Notification[] | null> {
    "use server";
    const notifications = await getAllNotificationByUserId(userId);
    return notifications;
  }

  return (
    <NotificationsSection
      session={session.user}
      onGetAllNotificationByUserId={handleGetAllNotificationByUserId}
    />
  );
}
