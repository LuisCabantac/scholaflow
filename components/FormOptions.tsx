import { QuestionType } from "@/components/FormsSection";

export default function FormOptions({
  options,
  optionType,
  onQuestionChange,
}: {
  options: string[] | undefined;
  optionType: QuestionType;
  onQuestionChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
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
  if (optionType === "shortAnswer")
    return (
      <input
        type="text"
        disabled
        className="w-full rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed"
        placeholder="Short answer text"
      />
    );
  if (optionType === "paragraph")
    return (
      <textarea
        disabled
        className="h-10 w-full rounded-md border border-[#dddfe6] bg-transparent px-4 py-2 placeholder:text-[#616572] focus:border-[#384689] focus:outline-none disabled:cursor-not-allowed"
        placeholder="Long answer text"
      ></textarea>
    );
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
