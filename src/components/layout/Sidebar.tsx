import { useTranslation } from "react-i18next";

import type { SessionUser } from "@/types/auth";
import { useSidebar } from "@/providers/SidebarProvider";

import Logo from "@/components/layout/Logo";
import SidebarLinks from "@/components/layout/SidebarLinks";

export default function Sidebar({ user }: { user: SessionUser }) {
  const { sidebarExpand, handleSidebarExpand } = useSidebar();
  const { t } = useTranslation("layout", { keyPrefix: "sidebar" });

  return (
    <nav className="relative">
      {sidebarExpand && (
        <button
          type="button"
          aria-label={t("toggle")}
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={handleSidebarExpand}
        />
      )}
      <div
        className={`fixed h-screen overflow-y-auto ${sidebarExpand ? "w-64 px-3 md:w-64" : "w-0 md:w-20 md:px-3"} border-sidebar-border bg-sidebar top-0 left-0 z-30 py-5 transition-all duration-300 ease-in-out md:static md:rounded-r-md md:border-r`}
      >
        <div className="flex items-center justify-between pl-3">
          <Logo showText={sidebarExpand} />
          <button
            type="button"
            aria-label={t("toggle")}
            onClick={handleSidebarExpand}
            className={sidebarExpand ? "block" : "hidden"}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              className="stroke-sidebar-ring hidden size-7 md:block"
            >
              <path stroke="none" d="M0 0h24v24H0z" />
              <path d="M6 4 H18 A2 2 0 0 1 20 6 V18 A2 2 0 0 1 18 20 H6 A2 2 0 0 1 4 18 V6 A2 2 0 0 1 6 4 z" />
              <path d="M9 4v16" />
            </svg>
            <svg
              aria-hidden="true"
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
        <SidebarLinks userId={user.id} role={user.role} />
      </div>
    </nav>
  );
}
