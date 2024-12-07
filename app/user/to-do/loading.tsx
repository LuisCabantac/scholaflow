export default function Loading() {
  return (
    <div className="flex flex-col items-start justify-start" role="status">
      <span className="sr-only">Loading…</span>
      <div className="flex items-center justify-between rounded-md bg-[#dbe4ff] p-1 font-medium shadow-sm">
        <div className="rounded-md bg-[#f3f6ff] px-3 py-2 shadow-sm transition-all">
          <div className="my-[3px] h-[0.875rem] w-16 animate-pulse rounded-md bg-[#dddfe6]"></div>
        </div>
        <div className="px-3 py-2 transition-all">
          <div className="h-[0.875rem] w-[2.95rem] animate-pulse rounded-md bg-[#c0c9e0]"></div>
        </div>
        <div className="px-3 py-2 transition-all">
          <div className="h-[0.875rem] w-10 animate-pulse rounded-md bg-[#c0c9e0]"></div>
        </div>
      </div>
      <ul className="mt-2 grid w-full gap-2">
        {Array(6)
          .fill(undefined)
          .map((_, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4"
            >
              <div className="flex gap-2">
                <div className="size-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="grid gap-2">
                  <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  <div className="h-[0.875rem] w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  <div className="mt-2 h-[0.75rem] w-16 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  <div className="block h-[0.75rem] w-14 animate-pulse rounded-md bg-[#e0e7ff] md:hidden"></div>
                </div>
              </div>
              <div className="hidden h-[0.875rem] w-16 animate-pulse rounded-md bg-[#e0e7ff] md:block"></div>
            </li>
          ))}
      </ul>
    </div>
  );
}
