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
  // const [showNotesForm, setShowNotesForm] = useState(false);

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
        <div className="flex items-start rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
          <Link
            href="/notifications?sort=all"
            className={`px-3 py-2 transition-all ${searchParams.get("sort") === "all" || searchParams.get("sort") === null ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
          >
            All
          </Link>
          <Link
            href="/notifications?sort=unread"
            className={`px-3 py-2 transition-all ${searchParams.get("sort") === "unread" ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
          >
            Unread
          </Link>
        </div>
        <button
          className="font-medium text-[#22317c] hover:text-[#384689]"
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
        </button>
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
                <li key={notification.id}>
                  <button
                    className="flex w-full gap-2 overflow-hidden rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4"
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
                            className={`${notification.isRead ? "font-medium" : "font-bold"}`}
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
                            className={`${notification.isRead ? "font-medium text-[#616572]" : "font-semibold"} hidden text-sm md:block`}
                          >
                            {isToday(notification.createdAt)
                              ? format(notification.createdAt, "h'h ago'")
                              : isYesterday(notification.createdAt)
                                ? "Yesterday"
                                : format(notification.createdAt, "MMM d")}
                          </p>
                        </div>
                        <p
                          className={`${notification.isRead ? "font-normal text-[#616572]" : "font-semibold"} text-start text-sm`}
                        >
                          {notification.resourceContent}
                        </p>
                        <p
                          className={`${notification.isRead ? "font-medium text-[#616572]" : "font-semibold"} block text-start text-sm md:hidden`}
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
                className="flex items-center justify-between gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4"
              >
                <div className="flex gap-2">
                  <div className="size-10 animate-pulse rounded-full bg-[#e0e7ff]"></div>
                  <div className="grid gap-2">
                    <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    <div className="h-[0.875rem] w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    <div className="block h-[0.75rem] w-14 animate-pulse rounded-md bg-[#e0e7ff] md:hidden"></div>
                  </div>
                </div>
                <div className="hidden h-[0.875rem] w-16 animate-pulse rounded-md bg-[#e0e7ff] md:block"></div>
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
