export default function Loading() {
  return (
    <div role="status">
      <span className="sr-only">Loading…</span>
      <div className="grid gap-4 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-12 w-12 animate-pulse rounded-full bg-[#dbe4ff]"></div>
            <div className="flex flex-col items-start justify-start">
              <div className="h-[1.125rem] w-40 animate-pulse rounded-md bg-[#dbe4ff]"></div>
            </div>
          </div>
          <div className="h-6 w-12 animate-pulse rounded-md bg-[#dbe4ff]"></div>
        </div>
        <div className="flex flex-col items-start justify-start gap-2 md:flex-row md:items-center md:justify-between">
          <div className="mt-0.5 grid gap-2 md:flex md:items-center">
            <div>
              <div className="mb-1 h-[0.875rem] w-48 animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <h4 className="text-xs font-medium text-[#616572]">Email</h4>
            </div>
            <div className="mx-4 hidden h-8 w-px bg-[#dbe4ff] md:block"></div>
            <div>
              <div className="mb-1 h-[0.875rem] w-20 animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <h4 className="text-xs font-medium text-[#616572]">School</h4>
            </div>
            <div className="mx-4 hidden h-8 w-px bg-[#dbe4ff] md:block"></div>
            <div>
              <div className="mb-1 h-[0.875rem] w-24 animate-pulse rounded-md bg-[#dbe4ff]"></div>
              <h4 className="text-xs font-medium text-[#616572]">Joined</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
