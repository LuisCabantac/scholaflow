import { Metadata } from "next";
import { redirect } from "next/navigation";

import { getFormByFormId } from "@/lib/data-service";
import { auth } from "@/lib/auth";
import { hasUser } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ formId: string }>;
}): Promise<Metadata> {
  const { formId } = await params;

  const form = await getFormByFormId(formId);

  return { title: `${form?.title} | Form`, description: form?.description };
}

export default async function Page({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const session = await auth();

  if (!hasUser(session)) return redirect("/signin");

  const { formId } = await params;

  const form = await getFormByFormId(formId);

  if (!form && session.user.role === "student") redirect("/user/classroom");

  if (!form && session.user.role === "teacher") redirect("/user/forms");

  return (
    <ul className="mx-6 grid gap-2">
      <li className="grid gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
        <h1 className="text-lg font-medium">
          Requirements Engineering and Design
        </h1>
        <p>
          This quiz focuses on requirements gathering, analysis, and software
          design principles.
        </p>
      </li>
      <li className="grid gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
        <div className="flex justify-between">
          <h4 className="font-medium">
            1. What is the primary goal of requirements gathering?
          </h4>
          <p className="text-[#f03e3e]">*</p>
        </div>
        <label className="flex items-center gap-2">
          <input type="radio" />
          a. To understand user needs and expectations.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          b. To define the technical specifications of the software.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          c. To create a project plan.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          d. To test the software.
        </label>
      </li>
      <li className="grid gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
        <div className="flex justify-between">
          <h4 className="font-medium">
            2. Which of the following is NOT a common technique for gathering
            requirements?
          </h4>
          <p className="text-[#f03e3e]">*</p>
        </div>
        <label className="flex items-center gap-2">
          <input type="radio" />
          a. Interviews
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          b. Surveys
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          c. Prototyping
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          d. Code reviews
        </label>
      </li>
      <li className="grid gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
        <div className="flex justify-between">
          <h4 className="font-medium">3. What is a user story?</h4>
          <p className="text-[#f03e3e]">*</p>
        </div>
        <label className="flex items-center gap-2">
          <input type="radio" />
          a. A detailed technical specification.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          b. A short, simple description of a feature from a user&apos;s
          perspective.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          c. A formal document outlining the project scope.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          d. A test case for a specific functionality.
        </label>
      </li>
      <li className="grid gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
        <div className="flex justify-between">
          <h4 className="font-medium">
            4. What is the purpose of a use case diagram?
          </h4>
          <p className="text-[#f03e3e]">*</p>
        </div>
        <label className="flex items-center gap-2">
          <input type="radio" />
          a. To visually represent the interactions between actors and the
          system.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          b. To define the data structures used in the software.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          c. To outline the steps involved in testing the software.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          d. To track the progress of development.
        </label>
      </li>
      <li className="grid gap-2 rounded-md border border-[#dddfe6] bg-[#f3f6ff] p-3 shadow-sm md:p-4">
        <div className="flex justify-between">
          <h4 className="font-medium">
            1. What is the primary goal of requirements gathering?
          </h4>
          <p className="text-[#f03e3e]">*</p>
        </div>
        <label className="flex items-center gap-2">
          <input type="radio" />
          a. To understand user needs and expectations.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          b. To define the technical specifications of the software.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          c. To create a project plan.
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" />
          d. To test the software.
        </label>
      </li>
    </ul>
  );
}
