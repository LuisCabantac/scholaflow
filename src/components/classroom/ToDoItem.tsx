import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ClientOnly, Link } from "@tanstack/react-router";
import { format, isThisYear, isToday, isYesterday } from "date-fns";

import type {
  ToDoItemProps,
  ToDoKind,
  ToDoTranslator,
} from "@/types/classroom";

const icons: Record<ToDoKind, ReactNode> = {
  assigned: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  ),
  missing: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
    />
  ),
  done: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  ),
};

export function postedWhen(date: Date | string, t: ToDoTranslator) {
  if (isToday(date)) return t("today");
  if (isYesterday(date)) return t("yesterday");
  return format(date, "MMM d");
}

export function dueLabel(date: Date | string, t: ToDoTranslator) {
  const time = format(date, "h:mm a");
  if (isToday(date)) return t("dueToday", { time });
  if (isYesterday(date)) return t("dueYesterday", { time });
  const year = isThisYear(date) ? "" : `${format(date, "y ")}`;
  return t("due", { date: `${format(date, "MMM d,")} ${year} ${time}` });
}

export default function ToDoItem(props: ToDoItemProps) {
  const { t } = useTranslation("classroom", { keyPrefix: "todo" });

  const streamId = props.kind === "done" ? props.item.streamId : props.item.id;
  const postedAt =
    props.kind === "done" ? props.item.streamCreatedAt : props.item.createdAt;

  return (
    <li>
      <Link
        to="/classroom/class/$classId/stream/$streamId"
        params={{ classId: props.item.classId, streamId }}
        className="group bg-card flex w-full items-center justify-between gap-2 rounded-xl border p-4 shadow-sm"
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
            {icons[props.kind]}
          </svg>
          <div>
            <p className="font-medium group-hover:underline">
              {props.item.title}
            </p>
            <p className="text-xs">{props.item.className}</p>
            <ClientOnly fallback={<div className="mt-2 h-8" />}>
              <div className="mt-2 grid items-center gap-1 text-xs">
                <p>{t("posted", { when: postedWhen(postedAt, t) })}</p>
                {props.kind === "assigned" &&
                  (props.item.dueDate ? (
                    <p className="text-foreground/70 text-xs">
                      {dueLabel(props.item.dueDate, t)}
                    </p>
                  ) : (
                    <p className="text-foreground/70 text-xs">
                      {t("noDueDate")}
                    </p>
                  ))}
                {props.kind === "missing" && props.item.dueDate && (
                  <p className="text-destructive text-xs">
                    {dueLabel(props.item.dueDate, t)}
                  </p>
                )}
                {props.kind === "done" && (
                  <p className="whitespace-nowrap">
                    {props.item.isGraded && props.item.isTurnedIn
                      ? t("score", { points: String(props.item.points) })
                      : props.item.isTurnedIn
                        ? t("turnedIn")
                        : ""}
                  </p>
                )}
              </div>
            </ClientOnly>
          </div>
        </div>
        {props.kind === "done" && <div />}
      </Link>
    </li>
  );
}
