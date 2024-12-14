export default function Loading() {
  return (
    <section className="grid gap-2" role="status">
      <span className="sr-only">Loading…</span>
      <div className="flex items-center justify-between">
        <p className="text-base font-medium">Recent forms</p>
        <div className="flex h-10 cursor-not-allowed items-center justify-center rounded-md bg-[#1b2763] px-4 py-2 font-medium text-[#d5dae6] shadow-sm">
          Create
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {Array(6)
          .fill(undefined)
          .map((_, index) => (
            <li
              key={index}
              className="h-[6rem] w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4"
            >
              <div className="grid gap-2">
                <div className="h-4 w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div>
                  <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  <div className="mt-1 h-[0.875rem] w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </section>
  );
}
