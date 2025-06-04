import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { db } from "@/drizzle";
import { auth } from "@/lib/auth";
import { RoleRequest } from "@/lib/schema";
import { roleRequest } from "@/drizzle/schema";
import { getUserByUserId } from "@/lib/user-service";

export async function getRoleRequest(
  userId: string,
): Promise<RoleRequest | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  const user = await getUserByUserId(userId);

  if (!user) return null;

  const [data] = await db
    .select()
    .from(roleRequest)
    .where(eq(roleRequest.userId, userId));

  return data || null;
}

export async function getAllRoleRequest(
  status: "pending" | "rejected",
): Promise<RoleRequest[] | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  if (session.user.role !== "admin") return null;

  const data = await db
    .select()
    .from(roleRequest)
    .where(eq(roleRequest.status, status))
    .orderBy(desc(roleRequest.createdAt));

  return !data?.length ? null : data;
}
