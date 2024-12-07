import ClassLoading from "@/components/ClassLoading";

export default function Loading() {
  return (
    <div className="relative overflow-hidden">
      <div className="grid items-start gap-4 md:grid-cols-[1fr_18rem]">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="h-4 w-16 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="h-4 w-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            </div>
            <div className="h-10 w-[6.25rem] animate-pulse rounded-md bg-[#e0e7ff]"></div>
          </div>
          <div className="mt-2 flex items-center justify-around rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:hidden">
            <div className="mt-1 grid gap-2">
              <div className="h-6 w-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="h-[0.75rem] w-14 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            </div>
            <div className="mx-4 h-8 w-px bg-[#dddfe6]"></div>
            <div className="mt-1 grid gap-2">
              <div className="h-6 w-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="h-[0.75rem] w-12 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            </div>
            <div className="mx-4 h-8 w-px bg-[#dddfe6]"></div>
            <div className="mt-1 grid gap-2">
              <div className="h-6 w-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="h-[0.75rem] w-8 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            </div>
          </div>
          <div className="mt-2 flex w-full flex-col items-start gap-2 rounded-md md:grid md:grid-cols-2">
            <ClassLoading />
            <ClassLoading />
          </div>
        </div>
        <div className="hidden overflow-hidden rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-4 md:block">
          <div className="mt-1.5 h-[1.125rem] w-16 animate-pulse rounded-md bg-[#e0e7ff]"></div>
          <div className="mt-3 flex items-center justify-between rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
            <div className="rounded-md bg-[#f3f6ff] px-3 py-2 shadow-sm transition-all">
              <div className="my-[3px] h-[0.875rem] w-16 animate-pulse rounded-md bg-[#dddfe6]"></div>
            </div>
            <div className="px-3 py-2 transition-all">
              <div className="h-[0.875rem] w-14 animate-pulse rounded-md bg-[#c0c9e0]"></div>
            </div>
            <div className="px-3 py-2 transition-all">
              <div className="h-[0.875rem] w-10 animate-pulse rounded-md bg-[#c0c9e0]"></div>
            </div>
          </div>
          <div className="mt-2 grid w-full gap-2">
            <div className="grid gap-2 rounded-md border border-[#dddfe6] p-4 font-medium shadow-sm">
              <div className="h-[0.875rem] w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            </div>
            <div className="grid gap-2 rounded-md border border-[#dddfe6] p-4 font-medium shadow-sm">
              <div className="h-[0.875rem] w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            </div>
            <div className="grid gap-2 rounded-md border border-[#dddfe6] p-4 font-medium shadow-sm">
              <div className="h-[0.875rem] w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
