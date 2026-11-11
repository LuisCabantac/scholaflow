import { queryOptions } from "@tanstack/react-query";

import {
  getAllNotificationByUserIdFn,
  getAllUnreadNotificationByUserIdFn,
} from "@/server/functions/notification";

export const notificationKeys = {
  all: ["notification"] as const,
  byUser: (userId: string) =>
    [...notificationKeys.all, "byUser", userId] as const,
  unreadByUser: (userId: string) =>
    [...notificationKeys.all, "unreadByUser", userId] as const,
};

export const notificationQueries = {
  byUser: (userId: string) =>
    queryOptions({
      queryKey: notificationKeys.byUser(userId),
      queryFn: () => getAllNotificationByUserIdFn({ data: userId }),
    }),
  unreadByUser: (userId: string) =>
    queryOptions({
      queryKey: notificationKeys.unreadByUser(userId),
      queryFn: () => getAllUnreadNotificationByUserIdFn({ data: userId }),
    }),
};
