import { headers } from "next/headers";
import { asc, eq, ilike } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/drizzle/index";
import { Account, User } from "@/lib/schema";
import { account, user } from "@/drizzle/schema";

export async function getUser(email: string): Promise<User | null> {
  const [data] = await db.select().from(user).where(eq(user.email, email));

  return data || null;
}

export async function getUserByUserId(userId: string): Promise<User | null> {
  const [data] = await db.select().from(user).where(eq(user.id, userId));

  return data || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [data] = await db.select().from(user).where(eq(user.email, email));

  return data || null;
}

export async function getAccountByUserId(
  userId: string,
): Promise<Account | null> {
  const [data] = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId));

  return data || null;
}

export async function getAllUser(): Promise<{
  success: boolean;
  message: string;
  data: User[] | [];
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session)
    return { success: false, message: "Error getting all users", data: [] };

  const data = await db.select().from(user).orderBy(asc(user.createdAt));

  if (!data.length)
    return { success: false, message: "Error getting all users", data: [] };

  return { success: true, message: "Fetch success", data };
}

export async function getUsersFilter(name: string): Promise<{
  success: boolean;
  message: string;
  data: User[] | [];
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session)
    return { success: false, message: "Error getting all users", data: [] };

  const data = await db
    .select()
    .from(user)
    .where(ilike(user.name, `%${name}%`));

  if (!data.length)
    return { success: false, message: "Error getting all users", data: [] };

  return { success: true, message: "Fetch success", data };
}
