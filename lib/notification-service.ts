import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { Notification } from "@/lib/schema";
import { notification } from "@/drizzle/schema";

export async function getAllNotificationByUserId(
  userId: string,
): Promise<Notification[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (session.user.id !== userId) return null;

  const data = await db
    .select()
    .from(notification)
    .where(eq(notification.userId, userId));

  return data;
}

export async function getAllUnreadNotificationByUserId(
  userId: string,
): Promise<Notification[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (session.user.id !== userId) return null;

  const data = await db
    .select()
    .from(notification)
    .where(
      and(eq(notification.userId, userId), eq(notification.isRead, false)),
    );

  return data;
}

export async function getNotificationByUserAndNotificationId(
  userId: string,
  notificationId: string,
): Promise<Notification | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (session.user.id !== userId) return null;

  const [data] = await db
    .select()
    .from(notification)
    .where(
      and(eq(notification.userId, userId), eq(notification.id, notificationId)),
    );

  return data;
}
