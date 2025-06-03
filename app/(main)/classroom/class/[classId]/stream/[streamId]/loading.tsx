"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { extractFirstUuid } from "@/lib/utils";

export default function Loading() {
  const pathname = usePathname();

  return (
    <div className="flex items-start gap-2" role="status">
      <span className="sr-only">Loading…</span>
      <div className="relative w-full">
        <div className="flex items-center gap-2">
          <Link href={`/classroom/class/${extractFirstUuid(pathname)}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
        </div>
        <div className="mb-3 mt-2 flex gap-1">
          <div className="size-10 flex-shrink-0 animate-pulse rounded-full bg-[#e0e7ff]"></div>
          <div className="grid w-full gap-2">
            <div className="h-4 w-44 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            <div className="h-3 w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
          </div>
        </div>
        <div className="w-full animate-pulse space-y-2.5">
          <div className="flex w-full items-center">
            <div className="h-[0.875rem] w-32 rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-24 rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
          </div>
          <div className="flex w-full items-center">
            <div className="h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-24 rounded-full bg-[#e0e7ff]"></div>
          </div>
          <div className="flex w-full items-center">
            <div className="h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-24 rounded-full bg-[#e0e7ff]"></div>
          </div>
          <div className="flex w-full items-center">
            <div className="h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-24 rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-80 rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
          </div>
          <div className="flex w-full items-center">
            <div className="ms-2 h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-80 rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-24 rounded-full bg-[#e0e7ff]"></div>
          </div>
          <div className="flex w-full items-center">
            <div className="ms-2 h-[0.875rem] w-32 rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-24 rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
          </div>
          <div className="flex w-full items-center">
            <div className="ms-2 h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-80 rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
          </div>
          <div className="flex w-full items-center">
            <div className="h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-full rounded-full bg-[#e0e7ff]"></div>
            <div className="ms-2 h-[0.875rem] w-24 rounded-full bg-[#e0e7ff]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
