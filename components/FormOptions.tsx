import { QuestionType } from "@/components/FormsSection";

export default function FormOptions({
  options,
  optionType,
}: {
  options: string[] | undefined;
  optionType: QuestionType;
}) {
  if (optionType === "checkboxes" && options)
    return (
      <>
        {options.map((option) => (
          <label key={option}>
            <input name={option} type="checkbox" />
            {option}
          </label>
        ))}
      </>
    );
  if (optionType === "multipleChoice" && options)
    return (
      <>
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 accent-[#384689]"
          >
            <input name={option} type="radio" />
            {option}
          </label>
        ))}
      </>
    );
  if (optionType === "shortAnswer") return <input type="text" />;
  if (optionType === "paragraph") return <textarea></textarea>;
  if (optionType === "dropdown" && options)
    return (
      <select>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
}
