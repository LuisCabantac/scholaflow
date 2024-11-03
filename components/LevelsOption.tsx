import React from "react";

import { ILevels } from "@/app/user/announcements/page";

import { capitalizeFirstLetter } from "@/lib/utils";

export default function LevelsOption({
  type,
  options,
  defaultValue,
  isLoading,
  handleChange,
}: {
  type?: "post";
  options: ILevels[] | null;
  defaultValue?: string;
  isLoading: boolean;
  handleChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="relative w-full">
      <select
        disabled={isLoading}
        required
        name="levels"
        className="level__select w-full cursor-pointer rounded-md border-2 border-[#dbe4ff] px-4 py-2 text-sm focus:border-[#384689] focus:outline-none md:px-5 md:py-3 md:text-base"
        defaultValue={defaultValue || "all-levels"}
        onChange={handleChange || (() => {})}
      >
        {type === "post" && <option value={"all-levels"}>All Levels</option>}
        {options &&
          options.map((option) => (
            <option key={option.id} value={option.level}>
              {option.level
                .split("-")
                .map((curOption) => capitalizeFirstLetter(curOption))
                .join(" ")}
            </option>
          ))}
      </select>
    </div>
  );
}
