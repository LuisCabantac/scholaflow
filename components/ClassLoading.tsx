export default function ClassLoading() {
  return (
    <ul className="contents" role="status">
      <span className="sr-only">Loading…</span>
      <li className="relative flex h-[9rem] w-full flex-col gap-2 rounded-md bg-[#f3f6ff] p-4 shadow-sm md:h-[10rem]">
        <div className="absolute left-3 top-3 grid w-[90%] gap-2 md:left-4 md:top-4">
          <div className="h-[1.125rem] w-[90%] animate-pulse rounded-md bg-[#e0e7ff]"></div>
          <div className="h-[0.875rem] w-16 animate-pulse rounded-md bg-[#e0e7ff]"></div>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 md:bottom-4 md:left-4">
          <div className="h-6 w-6 animate-pulse rounded-full bg-[#e0e7ff] md:h-8 md:w-8"></div>
          <div className="grid gap-1">
            <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
          </div>
        </div>
      </li>
      <li className="relative flex h-[9rem] w-full flex-col gap-2 rounded-md bg-[#f3f6ff] p-4 shadow-sm md:h-[10rem]">
        <div className="absolute left-3 top-3 grid w-[90%] gap-2 md:left-4 md:top-4">
          <div className="h-[1.125rem] w-[90%] animate-pulse rounded-md bg-[#e0e7ff]"></div>
          <div className="h-[0.875rem] w-16 animate-pulse rounded-md bg-[#e0e7ff]"></div>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 md:bottom-4 md:left-4">
          <div className="h-6 w-6 animate-pulse rounded-full bg-[#e0e7ff] md:h-8 md:w-8"></div>
          <div className="grid gap-1">
            <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
          </div>
        </div>
      </li>
    </ul>
  );
}
