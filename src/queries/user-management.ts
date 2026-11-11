import { queryOptions } from "@tanstack/react-query";

import {
  getAllRoleRequestsFn,
  getRoleRequestFn,
} from "@/server/functions/user-management";

export const userManagementKeys = {
  all: ["user-management"] as const,
  roleRequests: () => [...userManagementKeys.all, "roleRequests"] as const,
  roleRequestByUser: (userId: string) =>
    [...userManagementKeys.all, "roleRequestByUser", userId] as const,
};

export const userManagementQueries = {
  roleRequests: () =>
    queryOptions({
      queryKey: userManagementKeys.roleRequests(),
      queryFn: () => getAllRoleRequestsFn(),
    }),
  roleRequestByUser: (userId: string) =>
    queryOptions({
      queryKey: userManagementKeys.roleRequestByUser(userId),
      queryFn: () => getRoleRequestFn({ data: userId }),
    }),
};
