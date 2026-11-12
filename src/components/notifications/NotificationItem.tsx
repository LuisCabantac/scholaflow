import { useTranslation } from "react-i18next";
import { ClientOnly } from "@tanstack/react-router";

import type { Notification } from "@/lib/schema";
import { notificationTitleKey, notificationWhen } from "@/lib/notifications";

import UserAvatar from "@/components/shared/UserAvatar";

export default function NotificationItem({
  notification,
  onOpen,
}: {
  notification: Notification;
  onOpen: (notification: Notification) => void;
}) {
  const { t } = useTranslation("notifications");

  const whenText = () => {
    const when = notificationWhen(notification.createdAt);
    if (when.kind === "hours") return t("when.hours", { count: when.hours });
    if (when.kind === "minutes")
      return when.minutes
        ? t("when.minutes", { count: when.minutes })
        : t("when.justNow");
    if (when.kind === "yesterday") return t("when.yesterday");
    return when.date;
  };

  const weight = notification.isRead ? "font-medium" : "font-semibold";

  return (
    <li className="group">
      <button
        type="button"
        className="flex w-full gap-2 overflow-hidden rounded-xl py-3"
        onClick={() => onOpen(notification)}
      >
        <div className="flex w-full items-center gap-2 overflow-hidden">
          <UserAvatar
            src={notification.fromUserImage}
            alt={t("imageAlt", { name: notification.fromUserName })}
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full"
            onDragStart={(e) => e.preventDefault()}
          />
          <div className="w-full min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={`${notification.isRead ? "font-medium" : "font-bold"} text-foreground min-w-0 text-start [overflow-wrap:anywhere] group-hover:underline`}
              >
                {t(`titles.${notificationTitleKey(notification.type)}`, {
                  name: notification.fromUserName,
                })}
              </h3>
              <ClientOnly fallback={<p className="hidden h-5 w-16 md:block" />}>
                <p
                  className={`${weight} text-foreground/70 hidden shrink-0 text-sm whitespace-nowrap md:block`}
                >
                  {whenText()}
                </p>
              </ClientOnly>
            </div>
            <p
              className={`${notification.isRead ? "font-normal" : "font-semibold"} text-foreground/70 line-clamp-2 text-start text-sm [overflow-wrap:anywhere] group-hover:underline`}
            >
              {notification.resourceContent}
            </p>
            <ClientOnly fallback={<p className="block h-5 md:hidden" />}>
              <p
                className={`${weight} text-foreground/70 block text-start text-sm md:hidden`}
              >
                {whenText()}
              </p>
            </ClientOnly>
          </div>
        </div>
      </button>
    </li>
  );
}
