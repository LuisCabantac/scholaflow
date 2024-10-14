"use client";

import { usePathname } from "next/navigation";

function getLastRouteName(url: string) {
  const segments = url.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  return lastSegment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function HeaderTitle() {
  const pathname = usePathname();

  if (pathname.includes("/user/announcements/edit/"))
    return <h1 className="text-2xl font-semibold">Edit post</h1>;

  return (
    <h1 className="text-2xl font-semibold">{getLastRouteName(pathname)}</h1>
  );
}
