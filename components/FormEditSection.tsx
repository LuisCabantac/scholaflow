"use client";

import { useQuery } from "@tanstack/react-query";

import Button from "@/components/Button";
import { IForm } from "@/components/FormsSection";
import FormOptions from "@/components/FormOptions";

export default function FormEditSection({
  formId,
  onGetForm,
}: {
  formId: string;
  onGetForm: (formId: string) => Promise<IForm | null>;
}) {
  const { data: form } = useQuery({
    queryKey: [`form--${formId}--edit`],
    queryFn: () => onGetForm(formId),
  });

  return (
    <section className="grid grid-cols-[1fr_20rem] gap-4">
      <ul className="grid gap-2">
        <li className="rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
          <form className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                className="w-full border-none bg-transparent text-lg font-medium"
                defaultValue={form?.title}
                placeholder="Add title"
              />
              <Button type="primary">Publish</Button>
            </div>

            <input
              type="text"
              className="w-full border-none bg-transparent"
              defaultValue={form?.description}
              placeholder="Add description"
            />
          </form>
        </li>
        {form?.questionSet.map((form) => (
          <li
            key={form.id}
            className="rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4"
          >
            <form className="grid gap-2">
              <input
                type="text"
                name={`question-${form.id}`}
                defaultValue={form.question}
                className="w-full border-none bg-transparent font-medium"
              />
              <FormOptions optionType={form.type} options={form.options} />
              <button className="flex items-center gap-2 font-medium text-[#5c7cfa]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="size-3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                </svg>
                Add more options
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between border-t pt-2">
              <div className="flex items-center gap-2">
                <p className="font-medium">Question Type: </p>
                <select className="rounded-md border bg-transparent px-2 py-1">
                  <option>Multiple choice</option>
                  <option>Checkboxes</option>
                  <option>Dropdown</option>
                  <option>Paragraph</option>
                  <option>Short answer</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2">
                  Required
                  <input type="checkbox" className="accent-[#5c7cfa]" />
                </label>
                <div className="h-4 w-[1px] bg-[#dddfe6]"></div>
                <p className="text-[#f03e3e] hover:text-[#c92a2a]">Delete</p>
              </div>
            </div>
          </li>
        ))}
        <li className="flex items-center justify-center">
          <Button type="secondary">Add question</Button>
        </li>
      </ul>
      <div className="max-h-screen rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
        <h4 className="text-lg font-semibold tracking-tight">Responses</h4>
        <div className="mt-2 grid gap-2 border-b border-[#dddfe6] pb-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-[#5c7cfa]" />
            Release grades immediately
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-[#5c7cfa]" />
            Accepting submissions
          </label>
        </div>
        <p className="flex h-[8rem] items-center justify-center text-center font-medium">
          No responses
        </p>
      </div>
    </section>
  );
}
