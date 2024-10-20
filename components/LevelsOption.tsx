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
    <div className="relative w-full">
      <select
        disabled={isLoading}
        required
        name="levels"
        className="level__select w-full cursor-pointer rounded-md border-2 border-[#bec2cc] bg-[#edf2ff] px-4 py-2 text-sm focus:outline-2 focus:outline-[#384689] md:px-5 md:py-3 md:text-base"
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
