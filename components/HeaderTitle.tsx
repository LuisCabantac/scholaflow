"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { extractFirstUuid, getLastRouteName } from "@/lib/utils";

import { IClass } from "@/components/ClassroomSection";

export default function HeaderTitle({
  onGetClassByClassId,
}: {
  onGetClassByClassId: (classId: string) => Promise<IClass | null>;
}) {
  const pathname = usePathname();

  const { data } = useQuery({
    queryKey: [`class--${extractFirstUuid(pathname)}`],
    queryFn: () => onGetClassByClassId(extractFirstUuid(pathname) ?? ""),
  });

  if (pathname === "/classroom/class/")
    return (
      <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold md:text-2xl">
        Classroom
      </h1>
    );

  if (pathname.includes("/classroom/class/"))
    return (
      <>
        <h1 className="hidden overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold md:block md:text-2xl">
          {data ? data.className : "Classroom"}
        </h1>

        <h1 className="block overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold md:hidden md:text-2xl">
          {data?.className ?? "Classroom"}
        </h1>
      </>
    );

  if (pathname.includes("/to-do"))
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
