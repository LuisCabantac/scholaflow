import { queryOptions } from "@tanstack/react-query";

import { getAllUnreadNotificationByUserIdFn } from "@/server/functions/notification";

export const notificationKeys = {
  all: ["notification"] as const,
  unreadByUser: (userId: string) =>
    [...notificationKeys.all, "unreadByUser", userId] as const,
};

export const notificationQueries = {
  unreadByUser: (userId: string) =>
    queryOptions({
      queryKey: notificationKeys.unreadByUser(userId),
      queryFn: () => getAllUnreadNotificationByUserIdFn({ data: userId }),
    }),
};
