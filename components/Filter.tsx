import { ChangeEvent } from "react";

import { capitalizeFirstLetter } from "@/lib/utils";
import { ILevels } from "@/app/user/announcements/page";

export default function Filter({
  options,
  handleFilter,
}: {
  options: ILevels[] | null;
  handleFilter: (event: ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="relative">
      <select
        required
        name="levels"
        className="filter__select relative cursor-pointer rounded-md bg-transparent text-lg font-medium md:text-xl"
        onChange={handleFilter}
      >
        <option value="all levels">All</option>
        {options?.map((option) => (
          <option value={option.level} key={option.id}>
            {capitalizeFirstLetter(option.level)}
          </option>
        ))}
      </select>
    </div>
  );
}
