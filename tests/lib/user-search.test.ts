import { describe, expect, it } from "vitest";

import type { User } from "@/lib/schema";
import { filterUsers, userDetailsChanged } from "@/lib/user-search";

const user = (overrides: Partial<User>): User =>
  ({
    id: "u",
    name: "Someone",
    email: "someone@example.com",
    emailVerified: true,
    image: "",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    role: "user",
    schoolName: null,
    ...overrides,
  }) as User;

const ada = user({
  id: "ada",
  name: "Ada Lovelace",
  email: "ada@example.com",
  createdAt: new Date("2026-02-01T00:00:00Z"),
});
const grace = user({
  id: "grace",
  name: "Grace Hopper",
  email: "grace@navy.mil",
  createdAt: new Date("2026-01-01T00:00:00Z"),
});
const linus = user({
  id: "linus",
  name: "Linus Torvalds",
  email: "linus@kernel.org",
  createdAt: new Date("2026-03-01T00:00:00Z"),
});
const users = [ada, linus, grace];

describe("filterUsers", () => {
  it("keeps every user in createdAt order when the query is empty", () => {
    expect(filterUsers(users, "").map((u) => u.id)).toEqual([
      "grace",
      "ada",
      "linus",
    ]);
  });

  it("treats a whitespace-only query as empty", () => {
    expect(filterUsers(users, "   ")).toHaveLength(3);
  });

  it("matches the name case-insensitively", () => {
    expect(filterUsers(users, "ADA").map((u) => u.id)).toEqual(["ada"]);
  });

  it("matches the email", () => {
    expect(filterUsers(users, "kernel.org").map((u) => u.id)).toEqual([
      "linus",
    ]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterUsers(users, "zzzz-no-match")).toEqual([]);
  });

  it("returns an empty list for a missing list", () => {
    expect(filterUsers(null, "ada")).toEqual([]);
    expect(filterUsers(undefined, "")).toEqual([]);
  });

  it("orders ties by name and never mutates the input", () => {
    const sameDay = user({
      id: "zed",
      name: "Zed",
      createdAt: new Date("2026-02-01T00:00:00Z"),
    });
    const input = [sameDay, ada];
    expect(filterUsers(input, "").map((u) => u.id)).toEqual(["ada", "zed"]);
    expect(input.map((u) => u.id)).toEqual(["zed", "ada"]);
  });
});

describe("userDetailsChanged", () => {
  it("is false when only case and whitespace differ", () => {
    expect(
      userDetailsChanged(ada, {
        name: " Ada Lovelace ",
        email: "ADA@Example.com",
      }),
    ).toBe(false);
  });

  it("is true when the name changes", () => {
    expect(
      userDetailsChanged(ada, { name: "Ada King", email: "ada@example.com" }),
    ).toBe(true);
  });

  it("is true when the email changes", () => {
    expect(
      userDetailsChanged(ada, { name: "Ada Lovelace", email: "ada@new.org" }),
    ).toBe(true);
  });
});
