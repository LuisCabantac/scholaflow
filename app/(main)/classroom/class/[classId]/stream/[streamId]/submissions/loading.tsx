export default function Loading() {
  return (
    <div className="grid items-start" role="status">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col items-start gap-2">
        <div className="flex gap-1 rounded-full bg-muted p-1">
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted-foreground/20"></div>
          <div className="h-6 w-28 animate-pulse rounded-full bg-muted-foreground/20"></div>
        </div>
        <div className="mt-1.5 grid w-full items-start gap-8 md:grid-cols-[1fr_2fr]">
          <div className="grid w-full gap-2">
            <div className="h-[1.125rem] w-[90%] animate-pulse rounded-md bg-card md:h-[1.25rem]"></div>
            <div className="mt-1 flex items-center justify-around rounded-md border bg-card p-3 shadow-sm md:mt-0.5">
              <div className="mt-1 grid gap-2">
                <div className="h-6 w-6 animate-pulse rounded-md bg-card"></div>
                <div className="h-[0.75rem] w-[3.25rem] animate-pulse rounded-md bg-card"></div>
              </div>
              <div className="mx-4 h-8 w-px bg-muted"></div>
              <div className="mt-1 grid gap-2">
                <div className="h-6 w-6 animate-pulse rounded-md bg-card"></div>
                <div className="h-[0.75rem] w-[3.25rem] animate-pulse rounded-md bg-card"></div>
              </div>
              <div className="mx-4 h-8 w-px bg-muted"></div>
              <div className="mt-1 grid gap-2">
                <div className="h-6 w-6 animate-pulse rounded-md bg-card"></div>
                <div className="h-[0.75rem] w-11 animate-pulse rounded-md bg-card"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
