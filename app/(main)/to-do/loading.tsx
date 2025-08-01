export default function Loading() {
  return (
    <div className="flex flex-col items-start justify-start" role="status">
      <span className="sr-only">Loading…</span>
      <div className="flex gap-1 rounded-full bg-muted p-1">
        <div className="h-6 w-16 animate-pulse rounded-full bg-muted-foreground/20"></div>
        <div className="h-6 w-20 animate-pulse rounded-full bg-muted-foreground/20"></div>
        <div className="h-6 w-20 animate-pulse rounded-full bg-muted-foreground/20"></div>
      </div>
      <ul className="mt-2 grid w-full gap-2">
        {Array(6)
          .fill(undefined)
          .map((_, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-2 rounded-md border bg-card p-3 shadow-sm md:p-4"
            >
              <div className="flex gap-2">
                <div className="size-6 animate-pulse rounded-md bg-muted"></div>
                <div className="grid gap-2">
                  <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-muted"></div>
                  <div className="h-[0.875rem] w-24 animate-pulse rounded-md bg-muted"></div>
                  <div className="mt-2 h-[0.75rem] w-16 animate-pulse rounded-md bg-muted"></div>
                  <div className="block h-[0.75rem] w-14 animate-pulse rounded-md bg-muted md:hidden"></div>
                </div>
              </div>
              <div className="hidden h-[0.875rem] w-16 animate-pulse rounded-md bg-muted md:block"></div>
            </li>
          ))}
      </ul>
    </div>
  );
}
