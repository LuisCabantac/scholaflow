"use client";

import { usePathname } from "next/navigation";
import { validate as validateUUID } from "uuid";
import { useQuery } from "@tanstack/react-query";

import { Classroom } from "@/lib/schema";
import { extractFirstUuid, getLastRouteName } from "@/lib/utils";

export default function HeaderTitle({
  sessionId,
  onGetClassByClassId,
}: {
  sessionId: string | undefined;
  onGetClassByClassId: (classId: string) => Promise<Classroom | null>;
}) {
  const pathname = usePathname();
  const classId = extractFirstUuid(pathname);
  const isValidClassId = typeof classId === "string" && validateUUID(classId);

  const { data } = useQuery({
    queryKey: [
      `class--${extractFirstUuid(pathname)}`,
      `createdClasses--${sessionId}`,
    ],
    queryFn: () => onGetClassByClassId(extractFirstUuid(pathname)!),
    enabled: isValidClassId,
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
          {data ? data.name : "Classroom"}
        </h1>

        <h1 className="block overflow-hidden text-ellipsis whitespace-nowrap text-xl font-semibold md:hidden md:text-2xl">
          {data?.name ?? "Classroom"}
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
