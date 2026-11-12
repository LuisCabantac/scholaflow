import { and, desc, eq } from "drizzle-orm";
import { validate as validateUUID } from "uuid";

import { db } from "@/db";
import { notification } from "@/db/schema";
import type { Notification, NotificationType } from "@/lib/schema";

export async function getAllNotificationByUserId(
  userId: string,
): Promise<Notification[] | null> {
  const data = await db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt));
  return !data?.length ? null : data;
}

export async function getAllUnreadNotificationByUserId(
  userId: string,
): Promise<Notification[] | null> {
  const data = await db
    .select()
    .from(notification)
    .where(
      and(eq(notification.userId, userId), eq(notification.isRead, false)),
    );
  return !data?.length ? null : data;
}

export async function getNotificationByUserAndNotificationId(
  userId: string,
  notificationId: string,
): Promise<Notification | null> {
  if (!notificationId || !validateUUID(notificationId)) return null;

  const [data] = await db
    .select()
    .from(notification)
    .where(
      and(eq(notification.userId, userId), eq(notification.id, notificationId)),
    );
  return data || null;
}

export async function sendNotification(
  type: NotificationType,
  toUserId: string | string[],
  resourceId: string,
  resourceContent: string,
  resourceUrl: string,
  fromUserName: string,
  fromUserImage: string,
): Promise<void> {
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

    const newNotifications = toUserId.map((userId) => ({
      userId,
      type,
      fromUserName,
      fromUserImage,
      resourceId,
      resourceContent,
      resourceUrl,
    }));

    await db.insert(notification).values(newNotifications);
    return;
  }

  const singleUserId = toUserId as string;
  if (!singleUserId) return;

  const newNotification = {
    userId: singleUserId,
    type,
    fromUserName,
    fromUserImage,
    resourceId,
    resourceContent,
    resourceUrl,
  };

  await db.insert(notification).values(newNotification);
}

export async function updateNotificationIsRead(
  notificationId: string,
  isRead: boolean,
): Promise<void> {
  if (!notificationId || !validateUUID(notificationId)) return;

  await db
    .update(notification)
    .set({ isRead })
    .where(eq(notification.id, notificationId));
}

export async function deleteAllNotificationsByUserId(
  userId: string,
): Promise<void> {
  await db.delete(notification).where(eq(notification.userId, userId));
}

export async function deleteAllNotificationsByResourceId(
  resourceId: string,
): Promise<void> {
  if (!resourceId || !validateUUID(resourceId)) return;

  await db.delete(notification).where(eq(notification.resourceId, resourceId));
}

export async function deleteAllNotificationsByUserAndResourceId(
  userId: string,
  resourceId: string,
): Promise<void> {
  if (!resourceId || !validateUUID(resourceId)) return;

  await db
    .delete(notification)
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.resourceId, resourceId),
      ),
    );
}

export async function markAllAsReadNotificationsByUserId(
  userId: string,
): Promise<void> {
  await db
    .update(notification)
    .set({ isRead: true })
    .where(eq(notification.userId, userId));
}
