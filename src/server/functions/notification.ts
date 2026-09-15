import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import {
  updateNotificationIsRead,
  getAllNotificationByUserId,
  deleteAllNotificationsByUserId,
  getAllUnreadNotificationByUserId,
  markAllAsReadNotificationsByUserId,
  deleteAllNotificationsByResourceId,
  getNotificationByUserAndNotificationId,
  deleteAllNotificationsByUserAndResourceId,
} from "@/services/notification";

export const getAllNotificationByUserIdFn = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.id !== userId) return null;

    return await getAllNotificationByUserId(userId);
  });

export const getAllUnreadNotificationByUserIdFn = createServerFn({
  method: "GET",
})
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.id !== userId) return null;

    return await getAllUnreadNotificationByUserId(userId);
  });

export const readUnreadNotificationFn = createServerFn({ method: "POST" })
  .validator((data: { userId: string; notificationId: string }) => data)
  .handler(async ({ data: { userId, notificationId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || userId !== session.user.id || !notificationId) return;

    const existingNotification = await getNotificationByUserAndNotificationId(
      userId,
      notificationId,
    );
    if (!existingNotification) return;

    await updateNotificationIsRead(
      notificationId,
      !existingNotification.isRead,
    );
  });

export const deleteAllNotificationsByUserIdFn = createServerFn({
  method: "POST",
})
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || !userId || session.user.id !== userId) return;

    await deleteAllNotificationsByUserId(userId);
  });

export const deleteAllNotificationsByResourceIdFn = createServerFn({
  method: "POST",
})
  .validator((resourceId: string) => resourceId)
  .handler(async ({ data: resourceId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) return;

    await deleteAllNotificationsByResourceId(resourceId);
  });

export const deleteAllNotificationsByUserAndResourceIdFn = createServerFn({
  method: "POST",
})
  .validator((data: { userId: string; resourceId: string }) => data)
  .handler(async ({ data: { userId, resourceId } }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || !userId || session.user.id !== userId) return;

    await deleteAllNotificationsByUserAndResourceId(userId, resourceId);
  });

export const markAllAsReadNotificationsByUserIdFn = createServerFn({
  method: "POST",
})
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session || session.user.id !== userId) return;

    await markAllAsReadNotificationsByUserId(userId);
  });
