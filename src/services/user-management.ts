import { and, desc, eq } from "drizzle-orm";
import { validate as validateUUID } from "uuid";

import { db } from "@/db";
import { roleRequest } from "@/db/schema";
import type { RoleRequest } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";

export async function getRoleRequest(
  userId: string,
): Promise<RoleRequest | null> {
  if (!userId || !validateUUID(userId)) return null;

  const [data] = await db
    .select()
    .from(roleRequest)
    .where(eq(roleRequest.userId, userId));
  return data || null;
}

export async function getAllRoleRequests(
  status: "pending" | "rejected",
): Promise<RoleRequest[] | null> {
  const data = await db
    .select()
    .from(roleRequest)
    .where(eq(roleRequest.status, status))
    .orderBy(desc(roleRequest.createdAt));
  return !data?.length ? null : data;
}

export async function removeRoleRequestByUserId(userId: string): Promise<void> {
  if (!userId || !validateUUID(userId)) return;

  await db.delete(roleRequest).where(eq(roleRequest.userId, userId));
}

export async function deleteFileFromBucket(
  bucketName: string,
  filePath: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucketName).remove([filePath]);

  if (error) {
    throw new Error(
      `${filePath} cannot be deleted from the ${bucketName} bucket`,
    );
  }
}

export async function deleteFilesFromBucket(
  bucketName: string,
  filePaths: string[],
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucketName).remove(filePaths);

  if (error) {
    throw new Error(`Files cannot be deleted from the ${bucketName} bucket`);
  }
}

export async function createRoleRequestRecord(
  data: Omit<RoleRequest, "id" | "createdAt">,
): Promise<RoleRequest | null> {
  const [result] = await db
    .insert(roleRequest)
    .values(data as any)
    .returning();
  return result || null;
}

export async function deleteRoleRequestRecord(
  requestId: string,
  userId: string,
): Promise<RoleRequest | null> {
  if (
    !requestId ||
    !validateUUID(requestId) ||
    !userId ||
    !validateUUID(userId)
  ) {
    return null;
  }

  const [result] = await db
    .delete(roleRequest)
    .where(and(eq(roleRequest.id, requestId), eq(roleRequest.userId, userId)))
    .returning();
  return result || null;
}

export async function updateRoleRequestRecord(
  requestId: string,
  status: "pending" | "rejected",
): Promise<RoleRequest | null> {
  if (!requestId || !validateUUID(requestId)) return null;

  const [result] = await db
    .update(roleRequest)
    .set({ status })
    .where(eq(roleRequest.id, requestId))
    .returning();
  return result || null;
}
