"use client";

import { v4 as uuid } from "uuid";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Button from "@/components/Button";
import FormOptions from "@/components/FormOptions";
import { IForm, IQuestionSet } from "@/components/FormsSection";

export default function FormEditSection({
  formId,
  onGetForm,
}: {
  formId: string;
  onGetForm: (formId: string) => Promise<IForm | null>;
}) {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const { data: form } = useQuery({
    queryKey: [`form--${formId}--edit`],
    queryFn: () => onGetForm(formId),
  });

  const [questionSet, setQuestionSet] = useState<IQuestionSet[]>(
    form?.questionSet ?? [],
  );

  function handleQuestionChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    setQuestionSet((prevQuestion) =>
      prevQuestion.map((question) =>
        question.id === activeQuestion
          ? { ...question, [event.target.name]: event.target.value }
          : question,
      ),
    );
  }

  return (
    <section className="grid grid-cols-[1fr_20rem] gap-4">
      <ul className="flex flex-col gap-2">
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
        {questionSet.map((question) => (
          <li
            key={question.id}
            className={`rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4 ${activeQuestion !== question.id && "cursor-pointer"}`}
            onClick={() =>
              activeQuestion !== question.id && setActiveQuestion(question.id)
            }
          >
            <form className="grid gap-2">
              <input
                type="text"
                name="question"
                defaultValue={question.question}
                className="w-full border-none bg-transparent font-medium"
                onChange={handleQuestionChange}
              />
              <FormOptions
                onQuestionChange={handleQuestionChange}
                options={question.options}
                optionType={question.type}
              />
              {question.type !== "paragraph" &&
                question.type !== "shortAnswer" && (
                  <button
                    type="button"
                    className="flex items-center gap-2 font-medium text-[#5c7cfa]"
                  >
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
                )}
            </form>
            {activeQuestion === question.id && (
              <div className="mt-2 flex items-center justify-between border-t pt-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Question Type: </p>
                  <select
                    className="rounded-md border bg-transparent px-2 py-1"
                    defaultValue={question.type}
                    name="type"
                    onChange={handleQuestionChange}
                  >
                    <option value="multipleChoice">Multiple choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="shortAnswer">Short answer</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    Required
                    <input type="checkbox" className="accent-[#5c7cfa]" />
                  </label>
                  <div className="h-4 w-[1px] bg-[#dddfe6]"></div>
                  <button
                    type="button"
                    className="text-[#f03e3e] hover:text-[#c92a2a]"
                    onClick={() => {
                      if (question.id === activeQuestion)
                        setActiveQuestion(null);
                      setQuestionSet(
                        questionSet.filter(
                          (prevQuestion) => prevQuestion.id !== question.id,
                        ),
                      );
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        <li className="flex items-center justify-center">
          <Button
            type="secondary"
            onClick={() =>
              setQuestionSet([
                ...questionSet,
                {
                  id: uuid(),
                  type: "shortAnswer",
                  question: "Untitled Question",
                  required: false,
                },
              ])
            }
          >
            Add question
          </Button>
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
