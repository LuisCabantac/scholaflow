// import { ILevels } from "@/app/user/announcements/page";

export default function LevelsOption({
  // allLevels,
  defaultValue,
}: {
  // allLevels?: ILevels[];
  defaultValue?: string;
}) {
  return (
    <select
      required
      name="levels"
      className="level__select cursor-pointer rounded-md bg-[#ced8f7] px-4 py-2 text-sm md:px-5 md:py-3 md:text-base"
      defaultValue={defaultValue ? defaultValue : "all levels"}
    >
      <option value="all levels">All Levels</option>
      {/* {allLevels.map((level) => (
        <option key={level.id} value={level.level}>
          {capitalizeFirstLetter(level.level)}
        </option>
      ))} */}
    </select>
  );
}
