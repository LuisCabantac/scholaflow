"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { extractFirstUuid } from "@/lib/utils";

export default function ClassTabsStatic() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between pb-2">
      <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
        <Link
          href={`/user/classroom/class/${extractFirstUuid(pathname)}`}
          className={`${pathname === `/user/classroom/class/${extractFirstUuid(pathname)}` ? "rounded-md bg-[#edf2ff] shadow-sm" : "text-[#929bb4]"} px-3 py-2 transition-all`}
        >
          Stream
        </Link>
        <Link
          href={`/user/classroom/class/${extractFirstUuid(pathname)}/classwork`}
          className={`${pathname === `/user/classroom/class/${extractFirstUuid(pathname)}/classwork` ? "rounded-md bg-[#edf2ff] shadow-sm" : "text-[#929bb4]"} px-3 py-2 transition-all`}
        >
          Classwork
        </Link>
        <Link
          href={`/user/classroom/class/${extractFirstUuid(pathname)}/people`}
          className={`${pathname === `/user/classroom/class/${extractFirstUuid(pathname)}/people` ? "rounded-md bg-[#edf2ff] shadow-sm" : "text-[#929bb4]"} px-3 py-2 transition-all`}
        >
          People
        </Link>
        <Link
          href={`/user/classroom/class/${extractFirstUuid(pathname)}/chat`}
          className={`${pathname === `/user/classroom/class/${extractFirstUuid(pathname)}/chat` ? "rounded-md bg-[#edf2ff] shadow-sm" : "text-[#929bb4]"} px-3 py-2 transition-all`}
        >
          Chat
        </Link>
      </div>
    </div>
  );
}
