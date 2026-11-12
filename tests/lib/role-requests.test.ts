import { describe, expect, it } from "vitest";

import type { RoleRequest } from "@/lib/schema";
import { groupRoleRequests, roleRequestStatus } from "@/lib/role-requests";

const request = (overrides: Partial<RoleRequest>): RoleRequest =>
  ({
    id: "r",
    userId: "u",
    userName: "Someone",
    userEmail: "someone@example.com",
    userImage: "",
    status: "pending",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  }) as RoleRequest;

describe("roleRequestStatus", () => {
  it("defaults to pending", () => {
    expect(roleRequestStatus(undefined)).toBe("pending");
    expect(roleRequestStatus(null)).toBe("pending");
    expect(roleRequestStatus("pending")).toBe("pending");
  });

  it("returns rejected only for the exact value", () => {
    expect(roleRequestStatus("rejected")).toBe("rejected");
    expect(roleRequestStatus("Rejected")).toBe("pending");
    expect(roleRequestStatus("garbage")).toBe("pending");
  });
});

describe("groupRoleRequests", () => {
  it("splits requests by status, newest first", () => {
    const older = request({ id: "p1", createdAt: new Date("2026-01-01") });
    const newer = request({ id: "p2", createdAt: new Date("2026-02-01") });
    const rejected = request({ id: "r1", status: "rejected" });

    const grouped = groupRoleRequests([older, rejected, newer]);

    expect(grouped.pending.map((r) => r.id)).toEqual(["p2", "p1"]);
    expect(grouped.rejected.map((r) => r.id)).toEqual(["r1"]);
  });

  it("returns two empty lists for a missing list", () => {
    expect(groupRoleRequests(null)).toEqual({ pending: [], rejected: [] });
    expect(groupRoleRequests(undefined)).toEqual({ pending: [], rejected: [] });
  });
});
