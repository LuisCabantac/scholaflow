import { useTranslation } from "react-i18next";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";

import { classroomQueries } from "@/queries/classroom";
import { useSidebar } from "@/providers/SidebarProvider";
import { notificationQueries } from "@/queries/notification";

const activeLinkStyle =
  "bg-sidebar-accent text-sidebar-accent-foreground font-semibold stroke-sidebar-ring fill-sidebar-accent shadow-sm";
const inactiveLinkStyle =
  "fill-sidebar stroke-sidebar-foreground text-sidebar-foreground";

function truncate(value: string, max: number) {
  return value.length > max ? value.slice(0, max).concat("...") : value;
}

export default function SidebarLinks({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) {
  const { pathname } = useLocation();
  const { t } = useTranslation("layout", { keyPrefix: "sidebar" });
  const { isMobile, sidebarExpand, handleSidebarExpand } = useSidebar();

  const { data: createdClasses } = useSuspenseQuery(
    classroomQueries.byTeacher(userId),
  );
  const { data: enrolledClasses } = useSuspenseQuery(
    classroomQueries.enrolledByUser(userId),
  );
  const { data: unreadNotifications } = useSuspenseQuery(
    notificationQueries.unreadByUser(userId),
  );

  function closeOnDesktop() {
    if (!isMobile) handleSidebarExpand();
  }

  const labelClass = `text-base transition-all ${sidebarExpand ? "" : "md:hidden"}`;

  return (
    <div className="mt-8 grid gap-32 font-medium md:mt-6">
      <ul className="flex flex-col gap-3">
        {role === "admin" && (
          <li>
            <Link
              to="/user-management"
              className={`sidebar__links hover:bg-sidebar-accent flex items-center gap-2 rounded-xl px-4 py-3 transition-all md:pr-0 ${pathname === "/user-management" ? activeLinkStyle : inactiveLinkStyle}`}
              onClick={closeOnDesktop}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                strokeWidth={2}
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
              <span className={labelClass}>{t("userManagement")}</span>
            </Link>
          </li>
        )}
        {role !== "admin" && (
          <>
            <li>
              <Link
                to="/classroom"
                className={`sidebar__links hover:bg-sidebar-accent flex items-center justify-between gap-2 rounded-xl px-4 py-3 transition-all md:pr-4 ${pathname === "/classroom" || (pathname.includes("/classroom") && !sidebarExpand) ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={closeOnDesktop}
              >
                <div className="flex gap-2">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    className="size-6"
                  >
                    <path d="M8 19H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v11a1 1 0 01-1 1" />
                    <path d="M12 16 H16 A1 1 0 0 1 17 17 V18 A1 1 0 0 1 16 19 H12 A1 1 0 0 1 11 18 V17 A1 1 0 0 1 12 16 z" />
                  </svg>
                  <span className={labelClass}>{t("classroom")}</span>
                </div>
              </Link>
            </li>
            <li>
              <Link
                to="/to-do"
                className={`sidebar__links hover:bg-sidebar-accent flex items-center gap-2 rounded-xl px-4 py-3 transition-all md:pr-0 ${pathname === "/to-do" ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={closeOnDesktop}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
                <span className={labelClass}>{t("todo")}</span>
              </Link>
            </li>
          </>
        )}
        <li>
          <Link
            to="/notes"
            className={`sidebar__links hover:bg-sidebar-accent flex items-center gap-2 rounded-xl px-4 py-3 transition-all md:pr-0 ${pathname === "/notes" ? activeLinkStyle : inactiveLinkStyle}`}
            onClick={closeOnDesktop}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              className="size-6"
            >
              <path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm-7 10H7v-2h5v2zm5-4H7V8h10v2z" />
            </svg>
            <span className={labelClass}>{t("notes")}</span>
          </Link>
        </li>
        <li>
          <Link
            to="/notifications"
            className={`sidebar__links group hover:bg-sidebar-accent flex items-center gap-2 rounded-xl px-4 py-3 transition-all md:pr-0 ${pathname === "/notifications" ? activeLinkStyle : inactiveLinkStyle}`}
            onClick={closeOnDesktop}
          >
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                strokeWidth={2}
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              {unreadNotifications?.length ? (
                <div
                  className={`absolute top-0 -right-1 size-2 rounded-full transition-colors group-hover:bg-sidebar-ring ${pathname === "/notifications" ? "bg-sidebar-ring" : "bg-sidebar-foreground"}`}
                />
              ) : null}
            </div>
            <span className={labelClass}>{t("notifications")}</span>
          </Link>
        </li>
        <li className={sidebarExpand ? "" : "md:hidden"}>
          <ul className="flex flex-col gap-3">
            {createdClasses?.length ? (
              <li className="text-sidebar-foreground pl-4 text-xs">
                {t("created")}
              </li>
            ) : null}
            {createdClasses?.map((curClass) => (
              <li key={curClass.id}>
                <Link
                  to="/classroom/class/$classId"
                  params={{ classId: curClass.id }}
                  className={`${pathname.includes(curClass.id) ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground"} sidebar__links hover:bg-sidebar-accent grid min-w-0 items-center rounded-xl px-4 py-3 transition-all`}
                  onClick={closeOnDesktop}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: curClass.cardBackground }}
                    />
                    <span className="block truncate">
                      {truncate(curClass.name, 18)}
                    </span>
                  </div>
                  <span className="block truncate pl-5 text-xs">
                    {curClass.subject && `${curClass.subject} · `}
                    {truncate(curClass.section, 20)}
                  </span>
                </Link>
              </li>
            ))}
            {enrolledClasses?.length ? (
              <li className="text-sidebar-foreground pl-4 text-xs">
                {t("enrolled")}
              </li>
            ) : null}
            {enrolledClasses?.map((enrolledClass) => (
              <li key={enrolledClass.id}>
                <Link
                  to="/classroom/class/$classId"
                  params={{ classId: enrolledClass.classId }}
                  className={`${pathname.includes(enrolledClass.classId) ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground"} sidebar__links hover:bg-sidebar-accent grid min-w-0 rounded-xl px-4 py-3 transition-all`}
                  onClick={closeOnDesktop}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: enrolledClass.cardBackground }}
                    />
                    <span className="block truncate">
                      {truncate(enrolledClass.name, 18)}
                    </span>
                  </div>
                  <span className="block truncate pl-5 text-xs">
                    {enrolledClass.subject && `${enrolledClass.subject} · `}
                    {truncate(enrolledClass.section, 20)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
}
