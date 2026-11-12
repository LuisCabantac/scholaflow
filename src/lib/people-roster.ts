import type { EnrolledClass } from "@/lib/schema";

export function sortRoster(
  enrolled: EnrolledClass[] | null | undefined,
): EnrolledClass[] {
  if (!enrolled) return [];

  return [...enrolled].sort((a, b) =>
    a.userName.localeCompare(b.userName, undefined, { sensitivity: "base" }),
  );
}
