export default function Loading() {
  return (
    <div role="status" className="grid gap-4">
      <span className="sr-only">Loading…</span>
      <div className="mx-auto">
        <div className="flex flex-col items-center gap-y-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-muted md:h-24 md:w-24"></div>
          <div className="h-7 w-40 animate-pulse rounded-md bg-muted"></div>
          <div className="h-9 w-28 animate-pulse rounded-full bg-muted"></div>
        </div>
      </div>
      <div>
        <div className="mb-4 h-7 w-56 animate-pulse rounded-md bg-muted"></div>
        <div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-foreground/70">
                Email
              </h4>
              <div className="mt-1 h-5 w-full animate-pulse rounded-md bg-muted"></div>
            </div>
            <div className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-foreground/70">
                School
              </h4>
              <div className="mt-1 h-5 w-full animate-pulse rounded-md bg-muted"></div>
            </div>
            <div className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
              <h4 className="text-xs font-semibold text-foreground/70">
                Joined
              </h4>
              <div className="mt-1 h-5 w-full animate-pulse rounded-md bg-muted"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border bg-card p-0 shadow-sm md:p-3">
        <div className="p-4 pb-2">
          <div className="h-6 w-36 animate-pulse rounded-md bg-muted"></div>
        </div>
        <div className="p-4">
          <div className="flex flex-col items-start gap-y-3 md:flex-row md:items-center md:justify-between">
            <div className="h-4 w-full max-w-md animate-pulse rounded-md bg-muted"></div>
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
