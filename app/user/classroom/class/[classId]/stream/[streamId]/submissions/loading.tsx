"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { extractFirstUuid, extractStreamIdFromUrl } from "@/lib/utils";

export default function Loading() {
  const pathname = usePathname();

  return (
    <div className="grid items-start" role="status">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
          <Link
            href={`/user/classroom/class/${extractFirstUuid(pathname)}/stream/${extractStreamIdFromUrl(pathname)}`}
            className="px-3 py-2 text-[#929bb4] transition-all"
          >
            Instructions
          </Link>
          <Link
            href={`/user/classroom/class/${extractFirstUuid(pathname)}/stream/${extractStreamIdFromUrl(pathname)}/submissions`}
            className="rounded-md bg-[#edf2ff] px-3 py-2 shadow-sm transition-all"
          >
            Submissions
          </Link>
        </div>
        <div className="mt-1.5 grid w-full items-start gap-8 md:grid-cols-[1fr_2fr]">
          <div className="grid w-full gap-2">
            <div className="h-[1.125rem] w-full animate-pulse rounded-md bg-[#e0e7ff] md:h-[1.25rem]"></div>
            <div className="mt-1 flex items-center justify-around rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:mt-0.5">
              <div className="mt-1 grid gap-2">
                <div className="h-6 w-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="h-[0.75rem] w-[3.25rem] animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </div>
              <div className="mx-4 h-8 w-px bg-[#dddfe6]"></div>
              <div className="mt-1 grid gap-2">
                <div className="h-6 w-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="h-[0.75rem] w-[3.25rem] animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </div>
              <div className="mx-4 h-8 w-px bg-[#dddfe6]"></div>
              <div className="mt-1 grid gap-2">
                <div className="h-6 w-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="h-[0.75rem] w-11 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
