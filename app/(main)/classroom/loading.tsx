import ClassLoading from "@/components/ClassLoading";

export default function Loading() {
  return (
    <div className="relative overflow-hidden" role="status">
      <span className="sr-only">Loading…</span>
      <div className="grid items-start gap-4 md:grid-cols-[1fr_18rem]">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex cursor-not-allowed items-center gap-2 text-base font-medium text-[#595e62] md:gap-4">
              <span>All classes</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="size-4 rotate-0 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
            <div className="flex h-10 cursor-not-allowed items-center justify-center rounded-md bg-[#1b2763] px-4 py-2 font-medium text-[#d5dae6] shadow-sm">
              Add class
            </div>
          </div>
          <div className="mt-2 flex items-center justify-around rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:hidden">
            <div className="mt-2 grid gap-1.5">
              <div className="h-[1.15rem] w-7 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <h4 className="text-xs font-medium text-[#616572]">Assigned</h4>
            </div>
            <div className="mx-4 h-8 w-px bg-[#dddfe6]"></div>
            <div className="mt-2 grid gap-1.5">
              <div className="h-[1.15rem] w-7 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <h4 className="text-xs font-medium text-[#616572]">Missing</h4>
            </div>
            <div className="mx-4 h-8 w-px bg-[#dddfe6]"></div>
            <div className="mt-2 grid gap-1.5">
              <div className="h-[1.15rem] w-7 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <h4 className="text-xs font-medium text-[#616572]">Done</h4>
            </div>
          </div>
          <div className="mt-2 flex w-full flex-col items-start gap-2 rounded-md md:grid md:grid-cols-2">
            <ClassLoading />
            <ClassLoading />
          </div>
        </div>
        <div className="hidden overflow-hidden rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-4 md:block">
          <h3 className="text-lg font-medium tracking-tight">To-do</h3>
          <div className="mt-2 flex items-center justify-between rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
            <div className="cursor-not-allowed rounded-md bg-[#f3f6ff] px-3 py-2 shadow-sm transition-all">
              Assigned
            </div>
            <div className="cursor-not-allowed px-3 py-2 text-[#929bb4] transition-all">
              Missing
            </div>
            <div className="cursor-not-allowed px-3 py-2 text-[#929bb4] transition-all">
              Done
            </div>
          </div>
          <div className="mt-2 grid w-full gap-2">
            <div className="flex gap-2 rounded-md border border-[#dddfe6] p-4 font-medium shadow-sm">
              <div className="size-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="grid gap-2">
                <div className="h-[0.875rem] w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </div>
            </div>
            <div className="flex gap-2 rounded-md border border-[#dddfe6] p-4 font-medium shadow-sm">
              <div className="size-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="grid gap-2">
                <div className="h-[0.875rem] w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </div>
            </div>
            <div className="flex gap-2 rounded-md border border-[#dddfe6] p-4 font-medium shadow-sm">
              <div className="size-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="grid gap-2">
                <div className="h-[0.875rem] w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
