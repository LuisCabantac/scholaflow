"use client";

import { ISession } from "@/lib/auth";

import Logo from "@/components/Logo";
import SidebarLinks from "@/components/SidebarLinks";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Sidebar({ session }: { session: ISession | null }) {
  const { sidebarExpand, handleSidebarExpand } = useSidebar();

  return (
    <div className="relative">
      {sidebarExpand && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={handleSidebarExpand}
        ></div>
      )}
      <aside
        className={`fixed h-screen overflow-hidden ${sidebarExpand ? "w-[18rem] translate-x-0 px-4" : "w-0 -translate-x-full"} left-0 top-0 z-30 border-r-2 border-[#d6e0fd] bg-[#dbe4ff] pt-6 transition-transform ease-in-out md:static md:block md:w-[18rem] md:translate-x-0 md:px-[0.88rem]`}
      >
        <div className="flex items-center justify-between pl-4">
          <Logo />
          <button onClick={handleSidebarExpand} className="inline md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {session && (
          <SidebarLinks
            role={session.user.role}
            verified={session.user.verified}
          />
        )}
      </aside>
    </div>
  );
}
