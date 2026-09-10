import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/drizzle/index";
import { Verification } from "@/lib/schema";
import { verification } from "@/drizzle/schema";
import {
  createVerificationToken,
  deleteVerificationToken,
} from "@/lib/auth-actions";

export async function getVerificationToken(
  email: string,
): Promise<Verification | null> {
  const [data] = await db
    .select()
    .from(verification)
    .where(eq(verification.identifier, email));

  return data || null;
}

export async function getVerificationTokenByToken(
  token: string,
): Promise<Verification | null> {
  const [data] = await db
    .select()
    .from(verification)
    .where(eq(verification.value, token));

  return data || null;
}

export async function generateVerificationToken(
  email: string,
  type: "uuid" | "nanoid" = "uuid",
): Promise<Verification | null> {
  if (!type) return null;

  const token = type === "nanoid" ? nanoid() : uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const existingToken = await getVerificationToken(email);

  if (existingToken) {
    await deleteVerificationToken(email);
  }

  const verificationToken = await createVerificationToken(
    email,
    token,
    expiresAt,
  );

  return verificationToken;
}
