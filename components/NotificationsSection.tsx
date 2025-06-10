"use client";

import Link from "next/link";
import Image from "next/image";
import { format, isToday, isYesterday } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Notification, Session } from "@/lib/schema";
import noNotifications from "@/public/app/no_notifications.svg";
import {
  markAllAsReadNotificationsByUserId,
  readUnreadNotification,
} from "@/lib/notification-actions";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationsSection({
  session,
  onGetAllNotificationByUserId,
}: {
  session: Session;
  onGetAllNotificationByUserId(userId: string): Promise<Notification[] | null>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const {
    data: notifications,
    isPending: notificationsIsLoading,
    refetch,
  } = useQuery({
    queryKey: [`notifications--${session.id}`],
    queryFn: () => onGetAllNotificationByUserId(session.id),
  });
  return (
    <section className="flex flex-col items-start justify-start">
      <div className="flex w-full items-center justify-between">
        <Tabs
          defaultValue="all"
          value={
            searchParams.get("sort") === "all" ||
            searchParams.get("sort") === null
              ? "all"
              : "unread"
          }
        >
          <TabsList>
            <TabsTrigger value="all" asChild>
              <Link href="/notifications?sort=all">All</Link>
            </TabsTrigger>
            <TabsTrigger value="unread">
              <Link href="/notifications?sort=unread">Unread</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          onClick={async () => {
            await markAllAsReadNotificationsByUserId(session.id);
            queryClient.invalidateQueries({
              queryKey: [`notifications--${session.id}`],
            });
            queryClient.invalidateQueries({
              queryKey: [`notifications--${session.id}--unread`],
            });
            refetch();
          }}
        >
          Mark all as read
        </Button>
      </div>
      <ul className="mt-2 grid w-full gap-2">
        {notifications?.filter((notification) =>
          searchParams.get("sort") === "all" ||
          searchParams.get("sort") === null
            ? notification
            : !notification.isRead,
        ).length && !notificationsIsLoading ? (
          notifications
            ?.filter((notification) =>
              searchParams.get("sort") === "all" ||
              searchParams.get("sort") === null
                ? notification
                : !notification.isRead,
            )
            .map((notification) => {
              return (
                <li key={notification.id} className="group">
                  <button
                    className="flex w-full gap-2 overflow-hidden rounded-xl py-3"
                    onClick={() => {
                      if (!notification.isRead) {
                        readUnreadNotification(session.id, notification.id);
                        queryClient.invalidateQueries({
                          queryKey: [`notifications--${session.id}`],
                        });
                        queryClient.invalidateQueries({
                          queryKey: [`notifications--${session.id}--unread`],
                        });
                        refetch();
                      }
                      router.push(
                        `${process.env.NEXT_PUBLIC_APP_URL}${notification.resourceUrl}`,
                      );
                    }}
                  >
                    <div className="flex w-full items-center gap-2 overflow-hidden">
                      <Image
                        src={notification.fromUserImage}
                        alt={`${notification.fromUserName}'s image`}
                        width={40}
                        height={40}
                        className="rounded-full"
                        onDragStart={(e) => e.preventDefault()}
                      />
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`${notification.isRead ? "font-medium" : "font-bold"} text-foreground group-hover:underline`}
                          >
                            {notification.type === "stream" &&
                              `New announcement from ${notification.fromUserName}`}
                            {notification.type === "assignment" &&
                              `New assignment from ${notification.fromUserName}`}
                            {notification.type === "quiz" &&
                              `New quiz from ${notification.fromUserName}`}
                            {notification.type === "question" &&
                              `New question from ${notification.fromUserName}`}
                            {notification.type === "material" &&
                              `New material from ${notification.fromUserName}`}
                            {notification.type === "comment" &&
                              `New comment from ${notification.fromUserName}`}
                            {notification.type === "join" &&
                              `${notification.fromUserName} joined the class`}
                            {notification.type === "addToClass" &&
                              `${notification.fromUserName} added you to a class`}
                            {notification.type === "submit" &&
                              `${notification.fromUserName} submitted work`}
                          </h3>
                          <p
                            className={`${notification.isRead ? "font-medium" : "font-semibold"} hidden text-sm text-foreground/70 md:block`}
                          >
                            {isToday(notification.createdAt)
                              ? format(notification.createdAt, "h'h ago'")
                              : isYesterday(notification.createdAt)
                                ? "Yesterday"
                                : format(notification.createdAt, "MMM d")}
                          </p>
                        </div>
                        <p
                          className={`${notification.isRead ? "font-normal" : "font-semibold"} text-start text-sm text-foreground/70 group-hover:underline`}
                        >
                          {notification.resourceContent}
                        </p>
                        <p
                          className={`${notification.isRead ? "font-medium" : "font-semibold"} block text-start text-sm text-foreground/70 md:hidden`}
                        >
                          {isToday(notification.createdAt)
                            ? format(notification.createdAt, "h'h ago'")
                            : isYesterday(notification.createdAt)
                              ? "Yesterday"
                              : format(notification.createdAt, "MMM d")}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })
        ) : !notifications?.length && notificationsIsLoading ? (
          Array(6)
            .fill(undefined)
            .map((_, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-2 py-3"
              >
                <div className="flex gap-2">
                  <div className="size-10 animate-pulse rounded-full bg-muted"></div>
                  <div className="grid gap-2">
                    <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-muted"></div>
                    <div className="h-[0.875rem] w-24 animate-pulse rounded-md bg-muted"></div>
                    <div className="block h-[0.75rem] w-14 animate-pulse rounded-md bg-muted md:hidden"></div>
                  </div>
                </div>
                <div className="hidden h-[0.875rem] w-16 animate-pulse rounded-md bg-muted md:block"></div>
              </li>
            ))
        ) : (
          <li className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
            <div className="relative w-[15rem] md:w-[20rem]">
              <Image
                src={noNotifications}
                alt="no notifications"
                className="object-cover"
              />
            </div>
            <p className="font-medium md:text-lg">You&apos;re all caught up!</p>
          </li>
        )}
      </ul>
    </section>
  );
}
