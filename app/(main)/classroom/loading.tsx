import { PlusIcon, ChevronDown } from "lucide-react";

import ClassLoading from "@/components/ClassLoading";

export default function Loading() {
  return (
    <div className="relative overflow-hidden" role="status">
      <span className="sr-only">Loading…</span>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex cursor-not-allowed items-center gap-2 text-base font-medium text-foreground">
              <span>All classes</span>
              <ChevronDown strokeWidth={3} className="h-4 w-4" />
            </div>
            <div className="flex h-9 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-primary px-4 font-medium text-primary-foreground shadow-sm">
              <PlusIcon className="h-4 w-4" />
              Add class
            </div>
          </div>
          <div className="mt-2 rounded-xl border bg-card p-4 shadow-sm md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex cursor-not-allowed items-center gap-2">
                <div className="h-12 w-12 animate-pulse rounded-md bg-muted"></div>
                <div>
                  <span className="text-[0.65rem] text-foreground/70">
                    Assigned
                  </span>
                  <div className="h-8 w-8 animate-pulse rounded-md bg-muted"></div>
                </div>
              </div>
              <div className="flex cursor-not-allowed items-center gap-2">
                <div className="h-12 w-12 animate-pulse rounded-md bg-muted"></div>
                <div>
                  <span className="text-[0.65rem] text-foreground/70">
                    Missing
                  </span>
                  <div className="h-8 w-8 animate-pulse rounded-md bg-muted"></div>
                </div>
              </div>
              <div className="mr-2 flex cursor-not-allowed items-center gap-2">
                <div className="h-12 w-12 animate-pulse rounded-md bg-muted"></div>
                <div>
                  <span className="text-[0.65rem] text-foreground/70">
                    Done
                  </span>
                  <div className="h-8 w-8 animate-pulse rounded-md bg-muted"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2 flex w-full flex-col items-start gap-2 rounded-xl md:grid md:grid-cols-2 lg:grid-cols-3">
            <ClassLoading />
            <ClassLoading />
          </div>
        </div>
        <div className="hidden overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm md:block">
          <div className="px-4 pb-0 pt-4 text-lg font-medium tracking-tight">
            To-do
          </div>
          <div className="p-4">
            <div className="w-full">
              <div className="grid h-9 w-full grid-cols-3 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground">
                <div className="inline-flex cursor-not-allowed items-center justify-center whitespace-nowrap rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-foreground shadow-sm transition-none">
                  Assigned
                </div>
                <div className="inline-flex cursor-not-allowed items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 text-sm font-medium transition-none">
                  Missing
                </div>
                <div className="inline-flex cursor-not-allowed items-center justify-center whitespace-nowrap rounded-lg px-3 py-1 text-sm font-medium transition-none">
                  Done
                </div>
              </div>
            </div>
            <ul className="mt-2 grid w-full gap-2">
              <li>
                <div className="group flex w-full items-center justify-between gap-2 rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex gap-2">
                    <div className="mt-1 size-6 flex-shrink-0 animate-pulse rounded-md bg-muted"></div>
                    <div>
                      <div className="mb-1 h-[1.25rem] w-32 animate-pulse rounded-md bg-muted"></div>
                      <div className="mb-2 h-[0.75rem] w-20 animate-pulse rounded-md bg-muted"></div>
                      <div className="mt-2 grid gap-1">
                        <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-muted"></div>
                        <div className="h-[0.75rem] w-28 animate-pulse rounded-md bg-muted"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="group flex w-full items-center justify-between gap-2 rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex gap-2">
                    <div className="mt-1 size-6 flex-shrink-0 animate-pulse rounded-md bg-muted"></div>
                    <div>
                      <div className="mb-1 h-[1.25rem] w-36 animate-pulse rounded-md bg-muted"></div>
                      <div className="mb-2 h-[0.75rem] w-16 animate-pulse rounded-md bg-muted"></div>
                      <div className="mt-2 grid gap-1">
                        <div className="h-[0.75rem] w-20 animate-pulse rounded-md bg-muted"></div>
                        <div className="h-[0.75rem] w-32 animate-pulse rounded-md bg-muted"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="group flex w-full items-center justify-between gap-2 rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex gap-2">
                    <div className="mt-1 size-6 flex-shrink-0 animate-pulse rounded-md bg-muted"></div>
                    <div>
                      <div className="mb-1 h-[1.25rem] w-28 animate-pulse rounded-md bg-muted"></div>
                      <div className="mb-2 h-[0.75rem] w-24 animate-pulse rounded-md bg-muted"></div>
                      <div className="mt-2 grid gap-1">
                        <div className="w-22 h-[0.75rem] animate-pulse rounded-md bg-muted"></div>
                        <div className="w-18 h-[0.75rem] animate-pulse rounded-md bg-muted"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
