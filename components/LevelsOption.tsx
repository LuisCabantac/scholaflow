import { ILevels } from "@/app/user/announcements/page";

import { capitalizeFirstLetter } from "@/lib/utils";

export default function LevelsOption({
  options,
  defaultValue,
  isLoading,
}: {
  options: ILevels[] | null;
  defaultValue?: string;
  isLoading: boolean;
}) {
  return (
    <div className="relative">
      <select
        disabled={isLoading}
        required
        name="levels"
        className="level__select cursor-pointer rounded-md bg-[#ced8f7] py-2 pr-4 text-sm md:py-3 md:pr-5 md:text-base"
        defaultValue={defaultValue || "all levels"}
      >
        <option defaultValue={defaultValue}>All Levels</option>
        {options &&
          options.map((option) => (
            <option key={option.id} value={option.level}>
              {capitalizeFirstLetter(option.level)}
            </option>
          ))}
      </select>
    </div>
  );
}
