import type { RoleRequest } from "@/lib/schema";
import type {
  GroupedRoleRequests,
  RoleRequestStatus,
} from "@/types/user-management";

function newestFirst(a: RoleRequest, b: RoleRequest): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function roleRequestStatus(sort: unknown): RoleRequestStatus {
  return sort === "rejected" ? "rejected" : "pending";
}

export function groupRoleRequests(
  requests: RoleRequest[] | null | undefined,
): GroupedRoleRequests {
  const grouped: GroupedRoleRequests = { pending: [], rejected: [] };

  for (const request of requests ?? []) {
    grouped[request.status].push(request);
  }

  grouped.pending.sort(newestFirst);
  grouped.rejected.sort(newestFirst);

  return grouped;
}
