import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ClientOnly, Link } from "@tanstack/react-router";

import { useNow } from "@/hooks/use-now";
import { dueLabel, relativeDay } from "@/lib/stream-dates";
import type { ToDoItemProps, ToDoKind } from "@/types/classroom";

const icons: Record<ToDoKind, { className: string; path: ReactNode }> = {
  assigned: {
    className: "stroke-[#5c7cfa]",
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    ),
  },
  missing: {
    className: "stroke-destructive",
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
      />
    ),
  },
  done: {
    className: "stroke-[#5c7cfa]",
    path: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    ),
  },
};

export default function ToDoListItem(props: ToDoItemProps) {
  const { t } = useTranslation("todo");
  const now = useNow();

  const streamId = props.kind === "done" ? props.item.streamId : props.item.id;
  const postedAt =
    props.kind === "done" ? props.item.streamCreatedAt : props.item.createdAt;
  const dueDate = props.kind === "done" ? null : props.item.dueDate;
  const dayLabels = { today: t("today"), yesterday: t("yesterday") };

  const dueText = (date: Date | string) => {
    const label = dueLabel(date, now);
    if (label.kind === "today") return t("dueToday", { time: label.time });
    if (label.kind === "yesterday")
      return t("dueYesterday", { time: label.time });
    return t("due", { date: label.date });
  };

  const doneText =
    props.kind === "done"
      ? props.item.isGraded && props.item.isTurnedIn
        ? String(props.item.points)
        : props.item.isTurnedIn
          ? t("turnedIn")
          : ""
      : "";

  const sideText =
    props.kind === "assigned"
      ? dueDate
        ? dueText(dueDate)
        : t("noDueDate")
      : props.kind === "missing"
        ? dueDate
          ? dueText(dueDate)
          : null
        : doneText;
  const sideClass =
    props.kind === "missing" ? "text-destructive" : "text-foreground/70";
  const mobileClass =
    props.kind === "assigned"
      ? "text-foreground"
      : props.kind === "missing"
        ? "text-destructive"
        : "";

  return (
    <li>
      <Link
        to="/classroom/class/$classId/stream/$streamId"
        params={{ classId: props.item.classId, streamId }}
        className="group bg-card flex w-full items-center justify-between gap-2 rounded-md border p-3 shadow-sm md:p-4"
      >
        <div className="flex min-w-0 gap-2">
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`mt-1 size-6 shrink-0 ${icons[props.kind].className}`}
          >
            {icons[props.kind].path}
          </svg>
          <div className="min-w-0">
            <p className="text-foreground font-medium [overflow-wrap:anywhere] group-hover:underline">
              {props.item.title}
            </p>
            <p className="text-foreground/70 [overflow-wrap:anywhere]">
              {props.item.className}
            </p>
            <ClientOnly fallback={<div className="mt-2 h-8" />}>
              <div className="text-foreground/70 mt-2 grid gap-1 text-xs">
                <p>{t("posted", { when: relativeDay(postedAt, dayLabels) })}</p>
                {sideText !== null && (
                  <p className={`${mobileClass} md:hidden`}>{sideText}</p>
                )}
              </div>
            </ClientOnly>
          </div>
        </div>
        <ClientOnly fallback={<p className="hidden md:block" />}>
          {sideText !== null && (
            <p
              className={`hidden shrink-0 whitespace-nowrap ${sideClass} md:block`}
            >
              {sideText}
            </p>
          )}
        </ClientOnly>
      </Link>
    </li>
  );
}
