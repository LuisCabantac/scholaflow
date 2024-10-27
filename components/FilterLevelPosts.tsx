import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { capitalizeFirstLetter } from "@/lib/utils";
import { ILevels } from "@/app/user/announcements/page";
import { useClickOutside } from "@/contexts/ClickOutsideContext";

export default function FilterLevelPosts({
  options,
}: {
  options: ILevels[] | null;
}) {
  const searchParams = useSearchParams();
  const { useClickOutsideHandler } = useClickOutside();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  function handleShowFilterDropdown() {
    setShowFilterDropdown(!showFilterDropdown);
  }

  const filterWrapperRef = useRef<HTMLDivElement>(null);
  useClickOutsideHandler(filterWrapperRef, () => {
    setShowFilterDropdown(false);
  });

  return (
    <div className="flex items-start">
      <div
        className="relative flex cursor-pointer items-center justify-between gap-1 text-nowrap rounded-md py-[0.65rem] text-base font-medium md:gap-2 md:py-2 md:text-lg"
        onClick={handleShowFilterDropdown}
        ref={filterWrapperRef}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <span>
            {searchParams.get("filter") === null ||
            searchParams.get("filter") === "all-levels"
              ? "All posts"
              : `${searchParams
                  .get("filter")
                  ?.split("-")
                  .map((curOption) => capitalizeFirstLetter(curOption))
                  .join(" ")}`}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className={`${showFilterDropdown ? "rotate-180" : "rotate-0"} size-4 transition-transform`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
        <ul
          className={`${showFilterDropdown ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-[-10px] opacity-0"} ellipsis__popover absolute left-0 z-20 grid gap-2 rounded-md bg-[#f3f6ff] p-2 text-sm shadow-md transition-all ease-in-out`}
        >
          <li>
            <Link
              href="/user/announcements?filter=all-levels"
              className={`${searchParams.get("filter") === "all-levels" || searchParams.get("filter") === null ? "bg-[#c7d2f1] hover:bg-[#c7d2f1]" : "hover:bg-[#d8e0f5]"} block w-full rounded-md p-2 text-left`}
            >
              All posts
            </Link>
          </li>
          {options?.map((option) => (
            <li key={option.id}>
              <Link
                href={`/user/announcements?filter=${option.level}`}
                className={`${searchParams.get("filter") === option.level ? "bg-[#c7d2f1] hover:bg-[#c7d2f1]" : "hover:bg-[#d8e0f5]"} block w-full rounded-md p-2 text-left`}
              >
                {option.level
                  .split("-")
                  .map((curOption) => capitalizeFirstLetter(curOption))
                  .join(" ")}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
