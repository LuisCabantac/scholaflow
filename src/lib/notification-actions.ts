"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { notification } from "@/drizzle/schema";
import { NotificationType } from "@/lib/schema";
import { getNotificationByUserAndNotificationId } from "@/lib/notification-service";

export async function sendNotification(
  type: NotificationType,
  toUserId: string | string[],
  resourceId: string,
  resourceContent: string,
  resourceUrl: string,
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  if (
    Array.isArray(toUserId) &&
    toUserId.every((id) => typeof id === "string") &&
    (type === "stream" ||
      type === "assignment" ||
      type === "quiz" ||
      type === "question" ||
      type === "material")
  ) {
    if (!toUserId.length) return;

    const newNotifications = toUserId.map((userId) => {
      return {
        userId,
        type: type,
        fromUserName: session.user.name,
        fromUserImage: session.user.image as string,
        resourceId,
        resourceContent,
        resourceUrl,
      };
    });

    await db.insert(notification).values(newNotifications);

    revalidatePath("/notifications");
    return;
  }

  const newNotification = {
    userId: toUserId as string,
    type: type,
    fromUserName: session.user.name,
    fromUserImage: session.user.image as string,
    resourceId,
    resourceContent,
    resourceUrl,
  };

  await db.insert(notification).values(newNotification);

  revalidatePath("/notification");

  return;
}

export async function readUnreadNotification(
  userId: string,
  notificationId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return;

  if (!notificationId) return;

  if (userId !== session.user.id) return;

  const existingNotification = await getNotificationByUserAndNotificationId(
    userId,
    notificationId,
  );

  if (!existingNotification) return;

  await db
    .update(notification)
    .set({ isRead: !existingNotification.isRead })
    .where(eq(notification.id, notificationId));

  revalidatePath("/notifications");

  return;
}

export async function deleteAllNotificationsByUserId(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("You must be logged in.");

  if (!userId) throw new Error("User ID is required to delete notifications.");

  await db.delete(notification).where(eq(notification.userId, userId));

  return;
}

export async function deleteAllNotificationsByResourceId(resourceId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("You must be logged in.");

  await db.delete(notification).where(eq(notification.resourceId, resourceId));

  return;
}

export async function deleteAllNotificationsByUserAndResourceId(
  userId: string,
  resourceId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("You must be logged in.");

  if (!userId) throw new Error("User ID is required to delete notifications.");

  await db
    .delete(notification)
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.resourceId, resourceId),
      ),
    );

  return;
}

export async function markAllAsReadNotificationsByUserId(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("You must be logged in.");

  await db
    .update(notification)
    .set({ isRead: true })
    .where(eq(notification.userId, userId));
}
