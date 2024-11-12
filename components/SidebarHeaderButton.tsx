"use client";

import { useSidebar } from "@/contexts/SidebarContext";

export default function SidebarHeaderButton() {
  const { sidebarExpand, handleSidebarExpand } = useSidebar();

  return (
    <button
      className={`flex size-7 items-center ${sidebarExpand ? "md:hidden" : "block"}`}
      onClick={handleSidebarExpand}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="hidden size-7 md:block"
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
        className="block size-7 md:hidden"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
    </button>
  );
}
