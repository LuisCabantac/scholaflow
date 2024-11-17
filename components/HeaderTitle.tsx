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

  if (pathname.includes("/user/announcements/edit/"))
    return <h1 className="text-xl font-semibold md:text-2xl">Edit post</h1>;

  if (pathname === "/user/classroom/class/")
    return <h1 className="text-xl font-semibold md:text-2xl">Classroom</h1>;

  if (pathname.includes("/user/classroom/class/"))
    return (
      <>
        <h1 className="hidden text-xl font-semibold md:block md:text-2xl">
          {data ? data.className : "Classroom"}
        </h1>

        <h1 className="block text-xl font-semibold md:hidden md:text-2xl">
          {(data && data?.className?.length > 25
            ? data?.className.slice(0, 25).concat("...")
            : data?.className) ?? "Classroom"}
        </h1>
      </>
    );

  if (pathname.includes("/user/admin/user-management/edit-user"))
    return <h1 className="text-xl font-semibold md:text-2xl">Edit user</h1>;

  return (
    <h1 className="text-xl font-semibold md:text-2xl">
      {getLastRouteName(pathname)}
    </h1>
  );
}
