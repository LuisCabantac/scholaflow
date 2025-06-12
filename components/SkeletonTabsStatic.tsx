"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { extractFirstUuid } from "@/lib/utils";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SkeletonTabsStatic({
  skeletonRoute,
}: {
  skeletonRoute: "class" | "to-do";
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (skeletonRoute === "class")
    return (
      <Tabs className="mb-2">
        <TabsList>
          <TabsTrigger
            value="stream"
            asChild
            data-state={
              pathname === `/classroom/class/${extractFirstUuid(pathname)}`
                ? "active"
                : "inactive"
            }
          >
            <Link href={`/classroom/class/${extractFirstUuid(pathname)}`}>
              Stream
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="classwork"
            asChild
            data-state={
              pathname ===
              `/classroom/class/${extractFirstUuid(pathname)}/classwork`
                ? "active"
                : "inactive"
            }
          >
            <Link
              href={`/classroom/class/${extractFirstUuid(pathname)}/classwork`}
            >
              Classwork
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="people"
            asChild
            data-state={
              pathname ===
              `/classroom/class/${extractFirstUuid(pathname)}/people`
                ? "active"
                : "inactive"
            }
          >
            <Link
              href={`/classroom/class/${extractFirstUuid(pathname)}/people`}
            >
              People
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            asChild
            data-state={
              pathname === `/classroom/class/${extractFirstUuid(pathname)}/chat`
                ? "active"
                : "inactive"
            }
          >
            <Link href={`/classroom/class/${extractFirstUuid(pathname)}/chat`}>
              Chat
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      // <div className="flex items-center justify-between pb-2">
      //   <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
      //     <Link
      //       href={`/classroom/class/${extractFirstUuid(pathname)}`}
      //       className={`${pathname === `/classroom/class/${extractFirstUuid(pathname)}` ? "rounded-md bg-[#edf2ff] shadow-sm" : "text-[#929bb4]"} px-3 py-2 transition-all`}
      //     >
      //       Stream
      //     </Link>
      //     <Link
      //       href={`/classroom/class/${extractFirstUuid(pathname)}/classwork`}
      //       className={`${pathname === `/classroom/class/${extractFirstUuid(pathname)}/classwork` ? "rounded-md bg-[#edf2ff] shadow-sm" : "text-[#929bb4]"} px-3 py-2 transition-all`}
      //     >
      //       Classwork
      //     </Link>
      //     <Link
      //       href={`/classroom/class/${extractFirstUuid(pathname)}/people`}
      //       className={`${pathname === `/classroom/class/${extractFirstUuid(pathname)}/people` ? "rounded-md bg-[#edf2ff] shadow-sm" : "text-[#929bb4]"} px-3 py-2 transition-all`}
      //     >
      //       People
      //     </Link>
      //     <Link
      //       href={`/classroom/class/${extractFirstUuid(pathname)}/chat`}
      //       className={`${pathname === `/classroom/class/${extractFirstUuid(pathname)}/chat` ? "rounded-md bg-[#edf2ff] shadow-sm" : "text-[#929bb4]"} px-3 py-2 transition-all`}
      //     >
      //       Chat
      //     </Link>
      //   </div>
      // </div>
    );

  if (skeletonRoute === "to-do")
    return (
      <div className="flex items-start rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
        <Link
          href="/to-do?sort=assigned"
          className={`px-3 py-2 transition-all ${searchParams.get("sort") === "assigned" || searchParams.get("sort") === null ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
        >
          Assigned
        </Link>
        <Link
          href="/to-do?sort=missing"
          className={`px-3 py-2 transition-all ${searchParams.get("sort") === "missing" ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
        >
          Missing
        </Link>
        <Link
          href="/to-do?sort=done"
          className={`px-3 py-2 transition-all ${searchParams.get("sort") === "done" ? "rounded-md bg-[#f3f6ff] shadow-sm" : "text-[#929bb4]"}`}
        >
          Done
        </Link>
      </div>
    );
}
