export default function Loading() {
  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          <div className="w-[60%] animate-pulse cursor-not-allowed rounded-md border border-[#dddfe6] bg-[#eef3ff] px-4 py-2 text-[#616572] shadow-sm md:w-[50%]">
            Search...
          </div>
          <div className="h-10 w-[6.05rem] animate-pulse rounded-md bg-[#e0e7ff]"></div>
        </div>
      </div>
      <ul className="mt-2 columns-2 gap-2 md:columns-4">
        <li className="mb-2 w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
          <div className="grid gap-2">
            <div className="h-4 w-28 animate-pulse rounded-md bg-[#dbe4ff]"></div>
            <div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div className="mt-1 h-[0.875rem] w-20 animate-pulse rounded-md bg-[#dbe4ff]"></div>
            </div>
          </div>
        </li>
        <li className="mb-2 w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
          <div className="grid gap-2">
            <div className="h-4 w-24 animate-pulse rounded-md bg-[#dbe4ff]"></div>
            <div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
            </div>
          </div>
        </li>
        <li className="mb-2 w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
          <div className="grid gap-2">
            <div className="h-4 w-20 animate-pulse rounded-md bg-[#dbe4ff]"></div>
            <div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div className="mt-1 h-[0.875rem] w-20 animate-pulse rounded-md bg-[#dbe4ff]"></div>
            </div>
          </div>
        </li>
        <li className="mb-2 w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
          <div className="grid gap-2">
            <div className="h-4 w-20 animate-pulse rounded-md bg-[#dbe4ff]"></div>
            <div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>

              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#dbe4ff]"></div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}
