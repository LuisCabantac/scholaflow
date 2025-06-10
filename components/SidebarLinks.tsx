"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useSidebar } from "@/contexts/SidebarContext";
import { Classroom, EnrolledClass, Notification } from "@/lib/schema";

const activeLinkStyle =
  "bg-[#c7d2f1] text-[#384689] font-semibold stroke-[#5c7cfa] fill-[#c7d2f1] shadow-sm";
const inactiveLinkStyle = "fill-[#dbe4ff] stroke-[#929bb4] text-[#929bb4]";

export default function SidebarLinks({
  userId,
  role,
  onGetAllClassesByTeacherId,
  onGetAllUnreadNotificationByUserId,
  onGetAllEnrolledClassesByUserId,
}: {
  userId: string;
  role: string;
  onGetAllClassesByTeacherId: (id: string) => Promise<Classroom[] | null>;
  onGetAllUnreadNotificationByUserId(
    userId: string,
  ): Promise<Notification[] | null>;
  onGetAllEnrolledClassesByUserId: (
    userId: string,
  ) => Promise<EnrolledClass[] | null>;
}) {
  const pathname = usePathname();
  const { isMobile, sidebarExpand, handleSidebarExpand } = useSidebar();

  const { data: createdClasses, isPending: createdClassesIsPending } = useQuery(
    {
      queryKey: [`sidebar-createdClasses--${userId}`],
      queryFn: () => onGetAllClassesByTeacherId(userId),
    },
  );

  const { data: enrolledClasses, isPending: enrolledClassesIsPending } =
    useQuery({
      queryKey: [`sidebar-enrolledClasses--${userId}`],
      queryFn: () => onGetAllEnrolledClassesByUserId(userId),
    });

  const { data: unreadNotifications } = useQuery({
    queryKey: [`notifications--${userId}--unread`],
    queryFn: () => onGetAllUnreadNotificationByUserId(userId),
  });

  return (
    <div className="mt-8 grid gap-32 font-medium md:mt-6">
      <ul className="flex flex-col gap-3">
        {role === "admin" && (
          <>
            <li>
              <Link
                href="/user-management/"
                className={`sidebar__links flex items-center gap-2 rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname === "/user-management" ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={() => !isMobile && handleSidebarExpand()}
              >
                <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
                <span
                  className={`text-base transition-all ${sidebarExpand ? "" : "md:hidden"}`}
                >
                  User Management
                </span>
              </Link>
            </li>
          </>
        )}
        {role !== "admin" && (
          <>
            <li>
              <Link
                href="/classroom"
                className={`sidebar__links md flex items-center justify-between gap-2 rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1] md:pr-4 ${pathname === "/classroom" || (pathname.includes("/classroom") && !sidebarExpand) ? activeLinkStyle : inactiveLinkStyle} `}
                onClick={() => !isMobile && handleSidebarExpand()}
              >
                <div className="flex gap-2">
                  <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
                    <path d="M8 19H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v11a1 1 0 01-1 1" />
                    <path d="M12 16 H16 A1 1 0 0 1 17 17 V18 A1 1 0 0 1 16 19 H12 A1 1 0 0 1 11 18 V17 A1 1 0 0 1 12 16 z" />
                  </svg>
                  <span
                    className={`text-base transition-all ${sidebarExpand ? "" : "md:hidden"}`}
                  >
                    Classroom
                  </span>
                </div>
              </Link>
            </li>
            <li>
              <Link
                href="/to-do"
                className={`sidebar__links flex items-center gap-2 rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname === "/to-do" ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={() => !isMobile && handleSidebarExpand()}
              >
                <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
                <span
                  className={`text-base transition-all ${sidebarExpand ? "" : "md:hidden"}`}
                >
                  To-do
                </span>
              </Link>
            </li>
          </>
        )}
        <li>
          <Link
            href="/notes"
            className={`sidebar__links flex items-center gap-2 rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname === "/notes" ? activeLinkStyle : inactiveLinkStyle}`}
            onClick={() => !isMobile && handleSidebarExpand()}
          >
            <svg viewBox="0 0 24 24" strokeWidth={1.5} className="size-6">
              <path d="M19 4h-3V2h-2v2h-4V2H8v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm-7 10H7v-2h5v2zm5-4H7V8h10v2z" />
            </svg>
            <span
              className={`text-base transition-all ${sidebarExpand ? "" : "md:hidden"}`}
            >
              Notes
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/notifications"
            className={`sidebar__links flex items-center gap-2 rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname === "/notifications" ? activeLinkStyle : inactiveLinkStyle}`}
            onClick={() => !isMobile && handleSidebarExpand()}
          >
            <div className="relative">
              <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
              {unreadNotifications?.length ? (
                <div
                  className={`absolute -right-1 top-0 size-2 rounded-full ${pathname === "/notifications" ? "bg-[#5c7cfa]" : "bg-[#929bb4]"}`}
                ></div>
              ) : null}
            </div>
            <span
              className={`text-base transition-all ${sidebarExpand ? "" : "md:hidden"}`}
            >
              Notifications
            </span>
          </Link>
        </li>
        {(!createdClasses || !createdClasses.length) && null}
        {(!enrolledClasses || !enrolledClasses.length) && null}
        {createdClassesIsPending && (
          <li className={` ${sidebarExpand ? "" : "md:hidden"}`}>
            <ul className="flex flex-col gap-3">
              <li className="pl-4 text-xs text-[#929bb4]">Created</li>
              {Array(2)
                .fill(undefined)
                .map((_, index) => (
                  <li key={index} className="px-4 py-4" role="status">
                    <span className="sr-only">Loading…</span>
                    <div className="flex gap-2">
                      <div className="h-3 w-3 flex-shrink-0 animate-pulse rounded-full bg-[#929bb4]"></div>
                      <div className="grid gap-1">
                        <div className="h-[0.875rem] w-32 flex-shrink-0 animate-pulse rounded-md bg-[#929bb4]"></div>
                        <div className="h-3 w-8 flex-shrink-0 animate-pulse rounded-md bg-[#929bb4]"></div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </li>
        )}
        {
          <li className={` ${sidebarExpand ? "" : "md:hidden"}`}>
            <ul className="flex flex-col gap-3">
              {createdClasses?.length ? (
                <li className="pl-4 text-xs text-[#929bb4]">Created</li>
              ) : null}
              {createdClasses?.map((curClass) => (
                <li key={curClass.id}>
                  <Link
                    href={`/classroom/class/${curClass.id}`}
                    className={`${pathname.includes(curClass.id) ? "bg-[#c7d2f1] text-[#384689]" : "text-[#929bb4]"} sidebar__links grid items-center rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1]`}
                    onClick={() => !isMobile && handleSidebarExpand()}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor: curClass.cardBackground,
                        }}
                      ></div>
                      <span className="block whitespace-nowrap">
                        {curClass.name.length > 18
                          ? curClass.name.slice(0, 18).concat("...")
                          : curClass.name}
                      </span>
                    </div>
                    <span className="block whitespace-nowrap pl-5 text-xs">
                      {curClass.subject && `${curClass.subject} · `}
                      {curClass.section.length > 20
                        ? curClass.section.slice(0, 20).concat("...")
                        : curClass.section}
                    </span>
                  </Link>
                </li>
              ))}
              {role !== "admin" && enrolledClassesIsPending && (
                <li className={` ${sidebarExpand ? "" : "md:hidden"}`}>
                  <ul className="flex flex-col gap-3">
                    <li className="pl-4 text-xs text-[#929bb4]">Enrolled</li>
                    {Array(2)
                      .fill(undefined)
                      .map((_, index) => (
                        <li key={index} className="px-4 py-4" role="status">
                          <span className="sr-only">Loading…</span>
                          <div className="flex gap-2">
                            <div className="h-3 w-3 flex-shrink-0 animate-pulse rounded-full bg-[#929bb4]"></div>
                            <div className="grid gap-1">
                              <div className="h-[0.875rem] w-32 flex-shrink-0 animate-pulse rounded-md bg-[#929bb4]"></div>
                              <div className="h-3 w-8 flex-shrink-0 animate-pulse rounded-md bg-[#929bb4]"></div>
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </li>
              )}
              {enrolledClasses?.length ? (
                <li className="pl-4 text-xs text-[#929bb4]">Enrolled</li>
              ) : null}
              {enrolledClasses?.map((enrolledClass) => (
                <li key={enrolledClass.id}>
                  <Link
                    href={`/classroom/class/${enrolledClass.classId}`}
                    className={`${pathname.includes(enrolledClass.classId) ? "bg-[#c7d2f1] text-[#384689]" : "text-[#929bb4]"} sidebar__links grid rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1]`}
                    onClick={() => !isMobile && handleSidebarExpand()}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor: enrolledClass.cardBackground,
                        }}
                      ></div>
                      <span className="block whitespace-nowrap">
                        {enrolledClass.name.length > 18
                          ? enrolledClass.name.slice(0, 18).concat("...")
                          : enrolledClass.name}
                      </span>
                    </div>
                    <span className="block whitespace-nowrap pl-5 text-xs">
                      {enrolledClass.subject && `${enrolledClass.subject} · `}
                      {enrolledClass.section.length > 20
                        ? enrolledClass.section.slice(0, 20).concat("...")
                        : enrolledClass.section}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        }
      </ul>
    </div>
  );
}
