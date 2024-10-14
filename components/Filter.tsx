import { ChangeEvent } from "react";

export default function Filter({
  handleFilter,
}: {
  handleFilter: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="select-wrapper flex items-center gap-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6 md:size-7"
      >
        <path d="M7 11h10v2H7zM4 7h16v2H4zm6 8h4v2h-4z" />
      </svg>

      <select
        required
        name="levels"
        className="filter__select cursor-pointer rounded-md bg-transparent text-lg font-medium md:text-xl"
        onChange={handleFilter}
      >
        <option value="all">All</option>
        <option>College</option>
        <option>Senior High School</option>
        <option>Junior High School</option>
        <option>Elementary</option>
        <option value="kindergarten">Kindergarten</option>
      </select>
    </div>
  );
}
