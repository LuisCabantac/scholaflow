"use client";

import { useSidebar } from "@/contexts/SidebarContext";
import { Classroom, EnrolledClass, Notification, Session } from "@/lib/schema";

import Logo from "@/components/Logo";
import SidebarLinks from "@/components/SidebarLinks";

export default function Sidebar({
  session,
  onGetAllClassesByTeacherId,
  onGetAllEnrolledClassesByUserId,
  onGetAllUnreadNotificationByUserId,
}: {
  session: Session | null;
  onGetAllClassesByTeacherId: (id: string) => Promise<Classroom[] | null>;
  onGetAllUnreadNotificationByUserId(
    userId: string,
  ): Promise<Notification[] | null>;
  onGetAllEnrolledClassesByUserId: (
    userId: string,
  ) => Promise<EnrolledClass[] | null>;
}) {
  const { sidebarExpand, handleSidebarExpand } = useSidebar();

  return (
    <nav className="relative">
      {sidebarExpand && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={handleSidebarExpand}
        ></div>
      )}
      <div
        className={`fixed h-screen overflow-y-auto ${sidebarExpand ? "w-64 px-3 md:w-64" : "w-0 md:w-20 md:px-3"} left-0 top-0 z-30 border-sidebar-border bg-sidebar py-5 transition-all duration-300 ease-in-out md:static md:rounded-r-md md:border-r`}
      >
        <div className="flex items-center justify-between pl-3">
          <Logo showText={sidebarExpand} />
          <button
            onClick={handleSidebarExpand}
            className={sidebarExpand ? "block" : "hidden"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              className="hidden size-7 stroke-sidebar-ring md:block"
            >
              <path stroke="none" d="M0 0h24v24H0z" />
              <path d="M6 4 H18 A2 2 0 0 1 20 6 V18 A2 2 0 0 1 18 20 H6 A2 2 0 0 1 4 18 V6 A2 2 0 0 1 6 4 z" />
              <path d="M9 4v16" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="block size-6 md:hidden"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {session && session.id && (
          <SidebarLinks
            userId={session.id}
            role={session.role}
            onGetAllClassesByTeacherId={onGetAllClassesByTeacherId}
            onGetAllEnrolledClassesByUserId={onGetAllEnrolledClassesByUserId}
            onGetAllUnreadNotificationByUserId={
              onGetAllUnreadNotificationByUserId
            }
          />
        )}
      </div>
    </nav>
  );
}
