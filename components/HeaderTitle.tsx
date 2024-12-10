"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { extractFirstUuid, getLastRouteName } from "@/lib/utils";

import { IClass } from "@/components/ClassroomSection";
import { IForm } from "@/components/FormsSection";

export default function HeaderTitle({
  onGetForm,
  onGetClass,
}: {
  onGetForm: (formId: string) => Promise<IForm | null>;
  onGetClass: (classId: string) => Promise<IClass | null>;
}) {
  const pathname = usePathname();

  const { data: classData } = useQuery({
    queryKey: [`class--${extractFirstUuid(pathname)}`],
    queryFn: () => onGetClass(extractFirstUuid(pathname) ?? ""),
  });

  const { data: formData } = useQuery({
    queryKey: [`form--${extractFirstUuid(pathname)}`],
    queryFn: () => onGetForm(extractFirstUuid(pathname) ?? ""),
  });

  if (pathname.includes(`/user/forms/${formData?.id}`))
    return (
      <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold md:text-2xl">
        {formData ? formData.title : "Form"}
      </h1>
    );

  if (pathname.includes("/user/classroom/class/"))
    return (
      <>
        <h1 className="hidden overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold md:block md:text-2xl">
          {classData ? classData.className : "Classroom"}
        </h1>

        <h1 className="block overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold md:hidden md:text-2xl">
          {classData?.className ?? "Classroom"}
        </h1>
      </>
    );

  if (pathname.includes("/user/to-do"))
    return (
      <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold md:text-2xl">
        To-do
      </h1>
    );

  return (
    <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold md:text-2xl">
      {getLastRouteName(pathname)}
    </h1>
  );
}
