import type { User } from "@/lib/schema";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function filterUsers(
  users: User[] | null | undefined,
  query: string,
): User[] {
  if (!users) return [];

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(needle) ||
          user.email.toLowerCase().includes(needle),
      )
    : [...users];

  return matches.sort((a, b) => {
    const byDate =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return byDate !== 0 ? byDate : a.name.localeCompare(b.name);
  });
}

export function userDetailsChanged(
  current: Pick<User, "name" | "email">,
  next: { name: string; email: string },
): boolean {
  return (
    current.name.trim() !== next.name.trim() ||
    normalizeEmail(current.email) !== normalizeEmail(next.email)
  );
}
