import { Pen, Search } from "lucide-react";

export default function Loading() {
  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          <div className="group flex h-10 w-[60%] animate-pulse items-center gap-2 rounded-full border bg-muted text-sm md:w-[50%]">
            <Search className="mb-0.5 ml-3 h-4 w-4 stroke-muted-foreground" />
            <div className="mb-0.5 flex-1 py-2">
              <div className="h-4 w-20 rounded bg-muted-foreground/20" />
            </div>
          </div>
          <div className="flex h-9 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-primary px-4 font-medium text-primary-foreground shadow-sm">
            <Pen className="h-4 w-4" />
            New note
          </div>
        </div>
      </div>
      <ul className="mt-2 columns-2 gap-2 md:columns-4">
        <li className="brexl-all mb-2 w-full break-inside-avoid rounded-md border bg-card p-3 md:p-4">
          <div className="grid gap-2">
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted"></div>
            <div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
              <div className="mt-1 h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
            </div>
          </div>
        </li>
        <li className="mb-2 w-full break-inside-avoid break-all rounded-xl border bg-card p-3 md:p-4">
          <div className="grid gap-2">
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
            <div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
            </div>
          </div>
        </li>
        <li className="mb-2 w-full break-inside-avoid break-all rounded-xl border bg-card p-3 md:p-4">
          <div className="grid gap-2">
            <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
            <div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
              <div className="mt-1 h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
            </div>
          </div>
        </li>
        <li className="mb-2 w-full break-inside-avoid break-all rounded-xl border bg-card p-3 md:p-4">
          <div className="grid gap-2">
            <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
            <div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
              <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-muted"></div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}
