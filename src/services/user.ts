import { asc, eq, ilike } from "drizzle-orm";
import { validate as validateUUID } from "uuid";

import { db } from "@/db";
import { account, user } from "@/db/schema";
import type { Account, User } from "@/lib/schema";

export async function getUser(email: string): Promise<User | null> {
  const [data] = await db.select().from(user).where(eq(user.email, email));
  return data || null;
}

export async function getUserByUserId(userId: string): Promise<User | null> {
  if (!userId || !validateUUID(userId)) return null;

  const [data] = await db.select().from(user).where(eq(user.id, userId));
  return data || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [data] = await db.select().from(user).where(eq(user.email, email));
  return data || null;
}

export async function getUserIdById(
  email: string,
): Promise<{ id: string } | null> {
  const [data] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));
  return data || null;
}

export async function getAccountByUserId(
  userId: string,
): Promise<Account | null> {
  if (!userId || !validateUUID(userId)) return null;

  const [data] = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId));
  return data || null;
}

export async function getAllUser(): Promise<User[]> {
  const data = await db.select().from(user).orderBy(asc(user.createdAt));
  return data || [];
}

export async function getUsersFilter(name: string): Promise<User[]> {
  const data = await db
    .select()
    .from(user)
    .where(ilike(user.name, `%${name}%`));
  return data || [];
}

export async function updateUserRecord(
  userId: string,
  data: Partial<User>,
): Promise<User | null> {
  if (!userId || !validateUUID(userId)) return null;

  const [result] = await db
    .update(user)
    .set(data)
    .where(eq(user.id, userId))
    .returning();
  return result || null;
}

export async function deleteUserRecord(userId: string): Promise<User | null> {
  if (!userId || !validateUUID(userId)) return null;

  const [result] = await db.delete(user).where(eq(user.id, userId)).returning();

  return result || null;
}

export async function createUserRecord(data: any): Promise<User | null> {
  const [result] = await db.insert(user).values(data).returning();
  return result || null;
}
