"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useSidebar } from "@/contexts/SidebarContext";

import { IClass } from "@/components/ClassroomSection";

const activeLinkStyle =
  "bg-[#c7d2f1] text-[#384689] font-semibold stroke-[#5c7cfa] fill-[#c7d2f1] shadow-sm";
const inactiveLinkStyle = "fill-[#dbe4ff] stroke-[#929bb4] text-[#929bb4]";

export default function SidebarLinks({
  userId,
  role,
  onGetAllClassesByTeacherId,
  onGetAllEnrolledClassesByUserId,
}: {
  userId: string;
  role: string;
  onGetAllClassesByTeacherId: (id: string) => Promise<IClass[] | null>;
  onGetAllEnrolledClassesByUserId: (userId: string) => Promise<IClass[] | null>;
}) {
  const pathname = usePathname();
  const { isMobile, sidebarExpand, handleSidebarExpand } = useSidebar();

  const { data: createdClasses, isPending: createdClassesIsPending } = useQuery(
    {
      queryKey: ["createdClassesSidebar"],
      queryFn: () => onGetAllClassesByTeacherId(userId),
    },
  );

  const { data: enrolledClasses, isPending: enrolledClassesIsPending } =
    useQuery({
      queryKey: ["enrolledClassesSidebar"],
      queryFn: () => onGetAllEnrolledClassesByUserId(userId),
    });

  return (
    <div className="mt-8 grid gap-32 font-medium md:mt-6">
      <ul className="flex flex-col gap-3">
        {role === "admin" && (
          <li>
            <Link
              href="/user/user-management/"
              className={`sidebar__links flex items-center gap-2 rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname === "/user/user-management" ? activeLinkStyle : inactiveLinkStyle}`}
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
        )}
        {role !== "admin" && (
          <>
            <li>
              <Link
                href="/user/classroom"
                className={`sidebar__links md flex items-center justify-between gap-2 rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1] md:pr-4 ${pathname === "/user/classroom" || (pathname.includes("/user/classroom") && !sidebarExpand) ? activeLinkStyle : inactiveLinkStyle} `}
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
                href="/user/to-do"
                className={`sidebar__links flex items-center gap-2 rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1] md:pr-0 ${pathname === "/user/to-do" ? activeLinkStyle : inactiveLinkStyle}`}
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
            {createdClassesIsPending && null}
            {enrolledClassesIsPending && null}
            {(!createdClasses || !createdClasses.length) && null}
            {(!enrolledClasses || !enrolledClasses.length) && null}
            {
              <li className={` ${sidebarExpand ? "" : "md:hidden"}`}>
                <ul className="flex flex-col gap-3">
                  {createdClasses?.length ? (
                    <li className="pl-4 text-xs text-[#929bb4]">Created</li>
                  ) : null}
                  {createdClasses?.map((curClass) => (
                    <li key={curClass.classroomId}>
                      <Link
                        href={`/user/classroom/class/${curClass.classroomId}`}
                        className={`${pathname.includes(curClass.classroomId) ? "bg-[#c7d2f1] text-[#384689]" : "text-[#929bb4]"} sidebar__links grid items-center rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1]`}
                        onClick={() => !isMobile && handleSidebarExpand()}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 flex-shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                curClass.classCardBackgroundColor,
                            }}
                          ></div>
                          <span className="block text-sm">
                            {curClass.className.length > 22
                              ? curClass.className.slice(0, 22).concat("...")
                              : curClass.className}
                          </span>
                        </div>
                        <span className="block pl-5 text-xs">
                          {curClass.subject && `${curClass.subject} · `}
                          {curClass.section.length > 22
                            ? curClass.section.slice(0, 22).concat("...")
                            : curClass.section}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {enrolledClasses?.length ? (
                    <li className="pl-4 text-xs text-[#929bb4]">Enrolled</li>
                  ) : null}
                  {enrolledClasses?.map((enrolledClass) => (
                    <li key={enrolledClass.id}>
                      <Link
                        href={`/user/classroom/class/${enrolledClass.classroomId}`}
                        className={`${pathname.includes(enrolledClass.classroomId) ? "bg-[#c7d2f1] text-[#384689]" : "text-[#929bb4]"} sidebar__links grid rounded-md px-4 py-3 transition-all hover:bg-[#c7d2f1]`}
                        onClick={() => !isMobile && handleSidebarExpand()}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 flex-shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                enrolledClass.classCardBackgroundColor,
                            }}
                          ></div>
                          <span className="block text-sm">
                            {enrolledClass.className.length > 20
                              ? enrolledClass.className
                                  .slice(0, 20)
                                  .concat("...")
                              : enrolledClass.className}
                          </span>
                        </div>
                        <span className="block pl-5 text-xs">
                          {enrolledClass.subject &&
                            `${enrolledClass.subject} · `}
                          {enrolledClass.section.length > 22
                            ? enrolledClass.section.slice(0, 22).concat("...")
                            : enrolledClass.section}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            }
          </>
        )}
      </ul>
    </div>
  );
}
