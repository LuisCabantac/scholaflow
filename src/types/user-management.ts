import type { RoleRequest } from "@/lib/schema";

export type RoleRequestStatus = "pending" | "rejected";

export type GroupedRoleRequests = Record<RoleRequestStatus, RoleRequest[]>;

export type UserFormType = "create" | "edit";

export type UserMutationResult = {
  success: boolean;
  message: string;
  code?: "emailTaken";
};
