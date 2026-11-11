import { queryOptions } from "@tanstack/react-query";

import { getRoleRequestFn } from "@/server/functions/user-management";

export const userManagementKeys = {
  all: ["user-management"] as const,
  roleRequestByUser: (userId: string) =>
    [...userManagementKeys.all, "roleRequestByUser", userId] as const,
};

export const userManagementQueries = {
  roleRequestByUser: (userId: string) =>
    queryOptions({
      queryKey: userManagementKeys.roleRequestByUser(userId),
      queryFn: () => getRoleRequestFn({ data: userId }),
    }),
};
