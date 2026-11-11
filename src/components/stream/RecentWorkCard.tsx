import { useTranslation } from "react-i18next";
import { ClientOnly, Link } from "@tanstack/react-router";

import type { Stream } from "@/lib/schema";
import { longDateTime, relativeDay, timeOfDay } from "@/lib/stream-dates";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RecentWorkCard({
  stream,
}: {
  stream: Stream | undefined;
}) {
  const { t } = useTranslation(["stream", "classroom"]);

  const dayLabels = {
    today: t("classroom:todo.today"),
    yesterday: t("classroom:todo.yesterday"),
  };

  function dueText(date: Date) {
    if (relativeDay(date, dayLabels) === dayLabels.today)
      return t("classroom:todo.dueToday", { time: timeOfDay(date) });
    if (relativeDay(date, dayLabels) === dayLabels.yesterday)
      return t("classroom:todo.dueYesterday", { time: timeOfDay(date) });
    return t("classroom:todo.due", { date: longDateTime(date) });
  }

  return (
    <Card>
      <CardHeader className="px-4 pt-4 pb-0 text-lg font-medium tracking-tight">
        {t("stream:aside.recentWork")}
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        {stream ? (
          <div className="mt-2">
            <Link
              to="/classroom/class/$classId/stream/$streamId"
              params={{ classId: stream.classId, streamId: stream.id }}
              className="group border-border bg-card flex w-full items-center justify-between gap-2 rounded-xl border p-4 shadow-sm"
            >
              <div className="flex gap-2">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="stroke-sidebar-ring mt-1 size-6 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
                <div>
                  <p className="font-medium group-hover:underline">
                    {stream.title}
                  </p>
                  <ClientOnly fallback={<div className="mt-1 h-8" />}>
                    <div className="mt-1 grid gap-1 text-xs">
                      <p>
                        {t("classroom:todo.posted", {
                          when: relativeDay(stream.createdAt, dayLabels),
                        })}
                      </p>
                      <p className="text-foreground/70">
                        {stream.dueDate
                          ? dueText(new Date(stream.dueDate))
                          : t("classroom:todo.noDueDate")}
                      </p>
                    </div>
                  </ClientOnly>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <p className="text-foreground/70 flex h-[8rem] items-center justify-center text-center font-medium">
            {t("stream:aside.noClasswork")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
