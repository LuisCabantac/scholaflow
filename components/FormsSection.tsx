"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { formatDate } from "@/lib/utils";
import { ISession } from "@/lib/auth";
import { createForm } from "@/lib/form-actions";
import noForms from "@/public/app/no_forms.svg";

import Button from "@/components/Button";

export type QuestionType =
  | "shortAnswer"
  | "paragraph"
  | "multipleChoice"
  | "checkboxes"
  | "dropdown";

export interface IQuestionSet {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  answers?: string[];
  attachment?: string;
  required: boolean;
}

export interface IForm {
  id: string;
  title: string;
  author: string;
  description: string;
  questionSet: IQuestionSet[];
  created_at: string;
  isAQuiz: boolean;
  releaseGradesImmediately: boolean;
}

export default function FormsSection({
  session,
  onGetAllForms,
}: {
  session: ISession;
  onGetAllForms: (userId: string) => Promise<IForm[] | null>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: forms, isPending: formIsPending } = useQuery({
    queryKey: [`forms--${session.user.id}`],
    queryFn: () => onGetAllForms(session.user.id),
  });

  async function handleCreateForm() {
    setIsLoading(true);
    const data = await createForm(session.user.id);
    setIsLoading(false);
    if (data?.success && data?.formUrl) {
      queryClient.invalidateQueries({
        queryKey: [`forms--${session.user.id}`],
      });
      toast.success(data.message);
      router.push(data?.formUrl);
    } else toast.error(data?.message);
  }

  return (
    <section className="grid gap-2">
      <div className="flex items-center justify-between">
        <p className="text-base font-medium">Recent forms</p>
        <Button type="primary" onClick={handleCreateForm} isLoading={isLoading}>
          Create
        </Button>
      </div>
      {!formIsPending && !forms?.length ? (
        <div className="flex h-[30rem] w-full flex-col items-center justify-center gap-3 md:h-[25rem] md:gap-2">
          <div className="relative w-[15rem] md:w-[20rem]">
            <Image src={noForms} alt="no classes" className="object-cover" />
          </div>
          <p className="text-base font-medium">Add a class to get started.</p>
        </div>
      ) : null}
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {formIsPending && (
          <>
            {Array(6)
              .fill(undefined)
              .map((_, index) => (
                <li
                  key={index}
                  role="status"
                  className="h-[6rem] w-full break-inside-avoid break-all rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 md:p-4"
                >
                  <span className="sr-only">Loading…</span>
                  <div className="grid gap-2">
                    <div className="h-4 w-28 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    <div>
                      <div className="mt-1 h-[0.875rem] w-full animate-pulse rounded-md bg-[#e0e7ff]"></div>
                      <div className="mt-1 h-[0.875rem] w-36 animate-pulse rounded-md bg-[#e0e7ff]"></div>
                    </div>
                  </div>
                </li>
              ))}
          </>
        )}
        {forms?.length
          ? forms.map((form) => (
              <li
                key={form.id}
                className="max-h-[7.5rem] w-full rounded-md border border-[#dddfe6] bg-[#f3f6ff]"
              >
                <Link
                  href={`/user/forms/${form.id}/edit`}
                  className="grid h-full w-full gap-1 break-all p-3 md:p-4"
                >
                  <h4 className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {form.title}
                  </h4>
                  {form.description && (
                    <p className="overflow-hidden text-ellipsis">
                      {form.description}
                    </p>
                  )}
                  <p className="whitespace-nowrap text-xs text-[#616572]">
                    Created {formatDate(form.created_at)}
                  </p>
                </Link>
              </li>
            ))
          : null}
      </ul>
    </section>
  );
}
