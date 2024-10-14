"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import SignOutSidebar from "@/components/SignOutSidebar";
import { useSidebar } from "@/contexts/SidebarContext";

const activeLinkStyle =
  "bg-[#c7d2f1] text-[#384689] font-semibold stroke-[#5c7cfa] fill-[#c7d2f1]";
const inactiveLinkStyle = "fill-[#dbe4ff] stroke-[#929bb4] text-[#929bb4]";

export default function SidebarLinks({
  role,
  verified,
}: {
  role: string;
  verified: boolean;
}) {
  const pathname = usePathname();
  const { handleSidebarExpand } = useSidebar();

  return (
    <ul className="mt-6 grid gap-32 font-medium">
      <div className="flex flex-col gap-3">
        <li>
          <Link
            href="/user/dashboard"
            className={`sidebar__links flex items-center gap-2 rounded-md py-3 pl-4 pr-4 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname.includes("/user/dashboard") ? activeLinkStyle : inactiveLinkStyle}`}
            onClick={handleSidebarExpand}
          >
            <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
              <path d="M4 3 H9 A1 1 0 0 1 10 4 V11 A1 1 0 0 1 9 12 H4 A1 1 0 0 1 3 11 V4 A1 1 0 0 1 4 3 z" />
              <path d="M15 3 H20 A1 1 0 0 1 21 4 V7 A1 1 0 0 1 20 8 H15 A1 1 0 0 1 14 7 V4 A1 1 0 0 1 15 3 z" />
              <path d="M15 12 H20 A1 1 0 0 1 21 13 V20 A1 1 0 0 1 20 21 H15 A1 1 0 0 1 14 20 V13 A1 1 0 0 1 15 12 z" />
              <path d="M4 16 H9 A1 1 0 0 1 10 17 V20 A1 1 0 0 1 9 21 H4 A1 1 0 0 1 3 20 V17 A1 1 0 0 1 4 16 z" />
            </svg>
            <span className="text-base transition-all">Dashboard</span>
          </Link>
        </li>
        {verified && (
          <>
            <li>
              <Link
                href="/user/announcements"
                className={`sidebar__links flex items-center gap-2 rounded-md py-3 pl-4 pr-4 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname.includes("/user/announcements") ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={handleSidebarExpand}
              >
                <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
                  <path d="M3 11l18-5v12L3 14v-3zM11.6 16.8a3 3 0 11-5.8-1.6" />
                </svg>
                <span className="text-base transition-all">Announcements</span>
              </Link>
            </li>
            {role === "admin" && verified ? (
              <li>
                <Link
                  href="/user/admin"
                  className={`sidebar__links flex items-center gap-2 rounded-md py-3 pl-4 pr-4 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname.includes("/user/admin") ? activeLinkStyle : inactiveLinkStyle}`}
                  onClick={handleSidebarExpand}
                >
                  <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.867 19.125h.008v.008h-.008v-.008Z"
                    />
                  </svg>
                  <span className="text-base transition-all">Admin</span>
                </Link>
              </li>
            ) : null}
            <li>
              <Link
                href="/user/calendar"
                className={`sidebar__links flex items-center gap-2 rounded-md py-3 pl-4 pr-4 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname.includes("/user/calendar") ? activeLinkStyle : inactiveLinkStyle}`}
                onClick={handleSidebarExpand}
              >
                <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                <span className="text-base transition-all">Calendar</span>
              </Link>
            </li>
            {role === "student" || role === "teacher" ? (
              <>
                <li>
                  <Link
                    href="/user/classroom"
                    className={`sidebar__links md flex items-center gap-2 rounded-md py-3 pl-4 pr-4 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname.includes("/user/classroom") ? activeLinkStyle : inactiveLinkStyle} `}
                  >
                    <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
                      <path d="M8 19H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v11a1 1 0 01-1 1" />
                      <path d="M12 16 H16 A1 1 0 0 1 17 17 V18 A1 1 0 0 1 16 19 H12 A1 1 0 0 1 11 18 V17 A1 1 0 0 1 12 16 z" />
                    </svg>
                    <span className="text-base transition-all">Classroom</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/user/grades"
                    className={`sidebar__links flex items-center gap-2 rounded-md py-3 pl-4 pr-4 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname.includes("/user/grades") ? activeLinkStyle : inactiveLinkStyle} `}
                  >
                    <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
                      <path d="M19 21c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14zM9.553 9.658l4 2 1.553-3.105 1.789.895-2.447 4.895-4-2-1.553 3.105-1.789-.895 2.447-4.895z" />
                    </svg>
                    <span className="text-base transition-all">Grades</span>
                  </Link>
                </li>
              </>
            ) : null}
          </>
        )}
        <li className="border-t-2 border-[#d6e0fd] pt-3">
          <Link
            href="/user/profile"
            className={`sidebar__links flex items-center gap-2 rounded-md py-3 pl-4 pr-4 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname.includes("/user/profile") ? activeLinkStyle : inactiveLinkStyle} `}
          >
            <svg viewBox="0 0 24 24" strokeWidth={2} className="size-6">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <span className="text-base transition-all">Profile</span>
          </Link>
        </li>
        <li>
          <SignOutSidebar
            pathname={pathname}
            activeLinkStyle={activeLinkStyle}
            inactiveLinkStyle={inactiveLinkStyle}
          />
        </li>
      </div>
    </ul>
  );
}
