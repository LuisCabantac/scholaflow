import { Search } from "lucide-react";

import SkeletonTabsStatic from "@/components/SkeletonTabsStatic";

export default function ClassSuspense({
  route,
}: {
  route: "stream" | "classwork" | "people" | "chat";
}) {
  return (
    <div className="relative" role="status">
      <span className="sr-only">Loading…</span>
      <SkeletonTabsStatic skeletonRoute="class" />
      {route === "stream" && (
        <div className="grid gap-2">
          <div className="relative flex h-[9rem] w-full flex-col gap-2 rounded-xl bg-card p-4 shadow-sm md:h-[10rem]">
            <div className="absolute left-3 top-3 grid w-[90%] gap-2 md:left-4 md:top-4">
              <div className="h-[1.125rem] w-[90%] animate-pulse rounded-md bg-muted md:h-[1.5rem]"></div>
              <div className="h-[0.875rem] w-16 animate-pulse rounded-md bg-muted"></div>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 md:bottom-4 md:left-4">
              <div className="flex gap-1">
                <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
                <div className="h-[0.875rem] w-14 animate-pulse rounded-md bg-muted"></div>
              </div>
            </div>
          </div>
          <div className="grid items-start gap-2 md:grid-cols-[1fr_15rem]">
            <div>
              <div className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4">
                <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-muted md:h-10 md:w-10" />
                <div className="h-[0.875rem] w-32 animate-pulse rounded-md bg-muted"></div>
              </div>
              <div className="mb-2 flex cursor-not-allowed items-center gap-2 font-medium text-foreground md:gap-4">
                <span>All</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                  className="size-4 rotate-0 transition-transform"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
              <ul className="flex flex-col gap-2">
                <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4">
                  <div className="flex gap-2">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                    <div className="grid gap-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                </li>
                <li className="flex gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4">
                  <div className="size-8 animate-pulse rounded-md bg-muted"></div>
                  <div className="grid gap-2">
                    <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-muted"></div>
                    <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-muted"></div>
                  </div>
                </li>
                <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4">
                  <div className="flex gap-2">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                    <div className="grid gap-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                </li>
                <li className="flex gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4">
                  <div className="size-8 animate-pulse rounded-md bg-muted"></div>
                  <div className="grid gap-2">
                    <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-muted"></div>
                    <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-muted"></div>
                  </div>
                </li>
                <li className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4">
                  <div className="flex gap-2">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                    <div className="grid gap-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-muted"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded-md bg-muted"></div>
                </li>
                <li className="flex gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4">
                  <div className="size-8 animate-pulse rounded-md bg-muted"></div>
                  <div className="grid gap-2">
                    <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-muted"></div>
                    <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-muted"></div>
                  </div>
                </li>
              </ul>
            </div>
            <aside className="hidden gap-2 md:grid">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h4 className="pb-2 text-lg font-medium tracking-tight text-foreground">
                  Recent work
                </h4>
                <div className="flex gap-2 rounded-md border border-border p-4 font-medium shadow-sm">
                  <div className="size-6 animate-pulse rounded-md bg-muted"></div>
                  <div className="grid gap-2">
                    <div className="h-[0.875rem] w-28 animate-pulse rounded-md bg-muted"></div>
                    <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-muted"></div>
                    <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-muted"></div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
      {route === "classwork" && (
        <div>
          <div className="group flex h-10 w-[60%] animate-pulse items-center gap-2 rounded-full border bg-muted text-sm md:w-[50%]">
            <Search className="mb-0.5 ml-3 h-4 w-4 stroke-muted-foreground" />
            <div className="mb-0.5 flex-1 py-2">
              <div className="h-4 w-20 rounded bg-muted-foreground/20" />
            </div>
          </div>
          <div className="mt-2">
            <ul className="flex flex-col gap-2">
              {Array(6)
                .fill(undefined)
                .map((_, index) => (
                  <li
                    key={index}
                    className="flex gap-2 rounded-xl border border-border bg-card p-3 shadow-sm md:p-4"
                  >
                    <div className="size-8 animate-pulse rounded-md bg-muted"></div>
                    <div className="grid gap-2">
                      <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-muted"></div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
      {route === "people" && (
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium">All users</p>
          </div>
          <ul className="users__list rounded-md">
            {Array(6)
              .fill(undefined)
              .map((_, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
                    <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
      {route === "chat" && (
        <div className="flex w-full flex-col rounded-md md:border md:border-border md:bg-card md:p-4">
          <div className="relative pb-16">
            <ul className="grid h-[75dvh] items-end gap-2 overflow-auto rounded-md md:h-[65dvh]">
              <li className="justify-self-end">
                <div className="h-4 w-40 animate-pulse rounded-md bg-muted"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-60 animate-pulse rounded-md bg-muted"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-60 animate-pulse rounded-md bg-muted"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-28 animate-pulse rounded-md bg-muted"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-32 animate-pulse rounded-md bg-muted"></div>
              </li>
              <li className="justify-self-end">
                <div className="h-4 w-56 animate-pulse rounded-md bg-muted"></div>
              </li>
              <li className="justify-self-end">
                <div className="h-4 w-16 animate-pulse rounded-md bg-muted"></div>
              </li>
              <li className="justify-self-end">
                <div className="h-4 w-20 animate-pulse rounded-md bg-muted"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-40 animate-pulse rounded-md bg-muted"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-36 animate-pulse rounded-md bg-muted"></div>
              </li>
            </ul>
            <div className="fixed bottom-3 left-3 right-3 z-10 bg-[#edf2ff] pt-2 md:absolute md:bottom-0 md:left-0 md:right-0 md:w-full md:bg-card md:pt-0">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  className="size-6 animate-pulse stroke-muted"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <div className="h-[2.7rem] w-full animate-pulse rounded-md bg-muted"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
