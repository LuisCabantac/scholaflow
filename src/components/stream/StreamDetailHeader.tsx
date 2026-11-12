import { useTranslation } from "react-i18next";
import { ClientOnly } from "@tanstack/react-router";

import { useNow } from "@/hooks/use-now";
import type { Stream } from "@/lib/schema";
import {
  dueLabel,
  longDateTime,
  relativeDay,
  timeOfDay,
} from "@/lib/stream-dates";

import UserAvatar from "@/components/shared/UserAvatar";
import StreamTypeIcon from "@/components/stream/StreamTypeIcon";

function EditedIcon({ title }: { title: string }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="size-4"
    >
      <title>{title}</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
      />
    </svg>
  );
}

export default function StreamDetailHeader({ stream }: { stream: Stream }) {
  const { t } = useTranslation("stream", { keyPrefix: "card" });
  const now = useNow();
  const { t: tDetail } = useTranslation("stream", { keyPrefix: "detail" });

  const isScheduled =
    !!stream.scheduledAt && new Date(stream.scheduledAt) > now;
  const dayLabels = { today: t("today"), yesterday: t("yesterday") };

  function scheduledText(date: Date | string) {
    const day = relativeDay(date, dayLabels);
    if (day === dayLabels.today)
      return t("scheduledToday", { time: timeOfDay(date) });
    if (day === dayLabels.yesterday)
      return t("scheduledYesterday", { time: timeOfDay(date) });
    return t("scheduledAt", { date: longDateTime(date) });
  }

  function dueText(date: Date | string) {
    const label = dueLabel(date, now);
    if (label.kind === "today")
      return tDetail("dueToday", { time: label.time });
    if (label.kind === "yesterday")
      return tDetail("dueYesterday", { time: label.time });
    return tDetail("dueAt", { date: label.date });
  }

  const postedMeta = (
    <>
      {t("posted", { when: relativeDay(stream.createdAt, dayLabels) })}
      {stream.updatedAt && <EditedIcon title={t("edited")} />}
      {isScheduled && stream.scheduledAt && (
        <span>• {scheduledText(stream.scheduledAt)}</span>
      )}
    </>
  );

  if (stream.type === "stream") {
    return (
      <div className="mb-2 flex gap-2">
        <UserAvatar
          src={stream.userImage}
          alt={t("avatarAlt", { name: stream.userName })}
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full"
        />
        <div className="min-w-0">
          <p className="font-medium [overflow-wrap:anywhere]">
            {stream.userName}
          </p>
          <ClientOnly
            fallback={<p className="text-foreground/70 h-4 text-xs" />}
          >
            <p className="text-foreground/70 flex flex-wrap items-center gap-1 text-xs">
              {postedMeta}
            </p>
          </ClientOnly>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {stream.type !== "material" && (
        <div className="text-foreground/70 flex items-center justify-between gap-2">
          <ClientOnly fallback={<p className="h-6" />}>
            {stream.dueDate ? (
              <p>{dueText(stream.dueDate)}</p>
            ) : (
              <p>{tDetail("noDueDate")}</p>
            )}
          </ClientOnly>
          {stream.points !== null && (
            <p className="shrink-0 font-medium whitespace-nowrap tabular-nums">
              {tDetail("points", { count: stream.points })}
            </p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <StreamTypeIcon type={stream.type} />
        <div className="mb-2 min-w-0">
          <p className="text-base font-medium [overflow-wrap:anywhere]">
            {stream.title}
          </p>
          <ClientOnly fallback={<div className="h-4" />}>
            <div className="text-foreground/70 flex flex-wrap items-center gap-1 text-xs">
              <p className="[overflow-wrap:anywhere]">{stream.userName}</p>
              <span>•</span>
              <p className="flex flex-wrap items-center gap-1">{postedMeta}</p>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
  );
}
