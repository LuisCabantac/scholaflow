import ClassTabsStatic from "@/components/ClassTabsStatic";

export default function ClassSuspense({
  route,
}: {
  route: "stream" | "classwork" | "people" | "chat";
}) {
  return (
    <section className="relative">
      <ClassTabsStatic />
      {route === "stream" && (
        <div className="grid gap-2">
          <li className="relative flex h-[9rem] w-full flex-col gap-2 rounded-md bg-[#f3f6ff] p-4 shadow-sm md:h-[10rem]">
            <div className="absolute left-3 top-3 grid w-[90%] gap-2 md:left-4 md:top-4">
              <div className="h-[1.125rem] w-[90%] animate-pulse rounded-md bg-[#e0e7ff] md:h-[1.5rem]"></div>
              <div className="h-[0.875rem] w-16 animate-pulse rounded-md bg-[#e0e7ff]"></div>
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 md:bottom-4 md:left-4">
              <div className="flex gap-1">
                <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="h-[0.875rem] w-14 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </div>
            </div>
          </li>
          <div className="grid items-start gap-2 md:grid-cols-[1fr_15rem]">
            <div>
              <div className="mb-2 flex items-center gap-3 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
                <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-[#e0e7ff]" />
                <div className="h-[0.875rem] w-32 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </div>
              <div className="flex items-start justify-start">
                <div className="relative mb-2 flex items-center justify-between gap-1 text-nowrap rounded-md md:gap-2">
                  <div className="flex items-center gap-2 font-medium md:gap-4">
                    <div className="h-[0.875rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    <div className="h-4 w-6 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  </div>
                </div>
              </div>
              <ul className="flex flex-col gap-2">
                <li className="flex flex-col gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
                  <div className="flex gap-2">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-[#e0e7ff]"></div>
                    <div className="grid gap-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                      <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="flex gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
                  <div className="size-8 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  <div className="grid gap-2">
                    <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  </div>
                </li>
                <li className="flex flex-col gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
                  <div className="flex gap-2">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-[#e0e7ff]"></div>
                    <div className="grid gap-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                      <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="flex gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
                  <div className="size-8 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  <div className="grid gap-2">
                    <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  </div>
                </li>
                <li className="flex flex-col gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
                  <div className="flex gap-2">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-[#e0e7ff]"></div>
                    <div className="grid gap-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                      <div className="h-[0.875rem] w-20 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </li>
                <li className="flex gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
                  <div className="size-8 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  <div className="grid gap-2">
                    <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  </div>
                </li>
              </ul>
            </div>
            <aside className="hidden gap-2 md:grid">
              <div className="rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-4 shadow-sm">
                <div className="my-1.5 h-4 w-20 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                <div className="mt-4 grid gap-2 rounded-md border border-[#dddfe6] p-4 font-medium shadow-sm">
                  <div className="h-[0.875rem] w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  <div className="h-[0.75rem] w-10 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
      {route === "classwork" && (
        <div>
          <div className="flex items-center justify-between">
            <div className="h-10 w-full animate-pulse rounded-md bg-[#e0e7ff] md:w-[50%]"></div>
          </div>
          <div className="mt-2">
            <ul className="flex flex-col gap-2">
              {Array(6)
                .fill(undefined)
                .map((_, index) => (
                  <li
                    key={index}
                    className="flex gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4"
                  >
                    <div className="size-8 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    <div className="grid gap-2">
                      <div className="h-[0.875rem] w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                      <div className="h-[0.75rem] w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
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
            <div className="mt-1 h-4 w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
          </div>
          <ul className="users__list rounded-md">
            {Array(6)
              .fill(undefined)
              .map((_, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-[#f3f6ff] p-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-[#e0e7ff]"></div>
                    <div className="h-4 w-24 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
      {route === "chat" && (
        <div className="flex w-full flex-col rounded-md md:border md:border-[#dddfe6] md:bg-[#f3f6ff] md:p-4">
          <div className="relative pb-16">
            <ul className="grid h-[75dvh] items-end gap-2 overflow-auto rounded-md md:h-[65dvh]">
              <li className="justify-self-end">
                <div className="h-4 w-40 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-60 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-60 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-32 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </li>
              <li className="justify-self-end">
                <div className="h-4 w-56 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </li>
              <li className="justify-self-end">
                <div className="h-4 w-16 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </li>
              <li className="justify-self-end">
                <div className="h-4 w-20 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-40 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </li>
              <li className="justify-self-start">
                <div className="h-4 w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </li>
            </ul>
            <div className="fixed bottom-3 left-3 right-3 z-10 bg-[#edf2ff] pt-2 md:absolute md:bottom-0 md:left-0 md:right-0 md:w-full md:bg-[#f3f6ff] md:pt-0">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  className="size-6 animate-pulse stroke-[#e0e7ff]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <div className="h-[2.7rem] w-full animate-pulse rounded-md bg-[#e0e7ff]"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
