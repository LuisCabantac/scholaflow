import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type { SessionUser } from "@/types/auth";
import type { Notification } from "@/lib/schema";
import type { NotificationSort } from "@/types/notifications";
import { filterNotifications, hasUnread } from "@/lib/notifications";
import { notificationKeys, notificationQueries } from "@/queries/notification";
import {
  markAllAsReadNotificationsByUserIdFn,
  readUnreadNotificationFn,
} from "@/server/functions/notification";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoNotifications from "@/components/notifications/NoNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";

const sorts: NotificationSort[] = ["all", "unread"];

export default function NotificationsSection({
  user,
  sort,
}: {
  user: SessionUser;
  sort: NotificationSort;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation("notifications");

  const listKey = notificationKeys.byUser(user.id);
  const unreadKey = notificationKeys.unreadByUser(user.id);

  const { data: notifications } = useSuspenseQuery(
    notificationQueries.byUser(user.id),
  );

  const snapshot = async () => {
    await queryClient.cancelQueries({ queryKey: notificationKeys.all });
    return {
      list: queryClient.getQueryData<Notification[] | null>(listKey),
      unread: queryClient.getQueryData<Notification[] | null>(unreadKey),
    };
  };
  const rollback = (
    context: Awaited<ReturnType<typeof snapshot>> | undefined,
  ) => {
    if (!context) return;
    queryClient.setQueryData(listKey, context.list);
    queryClient.setQueryData(unreadKey, context.unread);
  };
  const settle = () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  const markAllAsRead = useMutation({
    mutationFn: () => markAllAsReadNotificationsByUserIdFn({ data: user.id }),
    onMutate: async () => {
      const context = await snapshot();
      queryClient.setQueryData<Notification[] | null>(listKey, (current) =>
        current?.map((item) => ({ ...item, isRead: true })),
      );
      queryClient.setQueryData<Notification[] | null>(unreadKey, null);
      return context;
    },
    onError: (error, _variables, context) => {
      rollback(context);
      toast.error(error.message);
    },
    onSettled: settle,
  });

  const markAsRead = useMutation({
    mutationFn: (notificationId: string) =>
      readUnreadNotificationFn({ data: { userId: user.id, notificationId } }),
    onMutate: async (notificationId) => {
      const context = await snapshot();
      queryClient.setQueryData<Notification[] | null>(listKey, (current) =>
        current?.map((item) =>
          item.id === notificationId ? { ...item, isRead: true } : item,
        ),
      );
      queryClient.setQueryData<Notification[] | null>(unreadKey, (current) => {
        const rest = current?.filter((item) => item.id !== notificationId);
        return rest?.length ? rest : null;
      });
      return context;
    },
    onError: (_error, _notificationId, context) => rollback(context),
    onSettled: settle,
  });

  const visible = filterNotifications(notifications, sort);

  function handleOpen(notification: Notification) {
    if (!notification.isRead) markAsRead.mutate(notification.id);
    navigate({ href: notification.resourceUrl });
  }

  return (
    <section className="flex flex-col items-start justify-start">
      <div className="flex w-full items-center justify-between">
        <Tabs value={sort}>
          <TabsList>
            {sorts.map((value) => (
              <TabsTrigger key={value} value={value} asChild>
                <Link to="/notifications" search={{ sort: value }}>
                  {t(value)}
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          className="hover:text-foreground/90 p-0 hover:bg-transparent"
          disabled={!hasUnread(notifications) || markAllAsRead.isPending}
          onClick={() => markAllAsRead.mutate()}
        >
          {t("markAllRead")}
        </Button>
      </div>
      <ul className="mt-2 grid w-full gap-2">
        {visible.length ? (
          visible.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onOpen={handleOpen}
            />
          ))
        ) : (
          <NoNotifications />
        )}
      </ul>
    </section>
  );
}
