"use client";

import { useSidebar } from "@/contexts/SidebarContext";

export default function SidebarHeaderButton() {
  const { handleSidebarExpand } = useSidebar();

  return (
    <button className="flex size-7 items-center" onClick={handleSidebarExpand}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="size-7"
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
