"use client";

import { usePathname } from "next/navigation";

import { getLastRouteName } from "@/lib/utils";

export default function HeaderTitle() {
  const pathname = usePathname();

  if (pathname.includes("/user/announcements/edit/"))
    return <h1 className="text-2xl font-semibold">Edit post</h1>;

  return (
    <h1 className="text-2xl font-semibold">{getLastRouteName(pathname)}</h1>
  );
}
