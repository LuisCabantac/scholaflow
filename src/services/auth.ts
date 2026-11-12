import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";
import { eq, or } from "drizzle-orm";

import { db } from "@/db";
import { verification } from "@/db/schema";
import type { Verification } from "@/lib/schema";
import { tokenIdentifier } from "@/lib/auth-tokens";
import type { TokenPurpose, TokenType } from "@/types/auth";

export async function getVerificationToken(
  email: string,
  purpose: TokenPurpose,
): Promise<Verification | null> {
  const [data] = await db
    .select()
    .from(verification)
    .where(eq(verification.identifier, tokenIdentifier(purpose, email)));

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

export async function deleteVerificationToken(
  email: string,
  purpose: TokenPurpose,
): Promise<void> {
  await db
    .delete(verification)
    .where(eq(verification.identifier, tokenIdentifier(purpose, email)));
}

export async function createVerificationToken(
  email: string,
  purpose: TokenPurpose,
  token: string,
  expiresAt: Date,
): Promise<Verification> {
  const [data] = await db
    .insert(verification)
    .values({
      id: uuidv4(),
      identifier: tokenIdentifier(purpose, email),
      value: token,
      expiresAt,
    })
    .returning();

  if (!data) {
    throw new Error("Verification Token could not be created");
  }

  return data;
}

export async function generateVerificationToken(
  email: string,
  purpose: TokenPurpose,
  type: TokenType = "uuid",
): Promise<Verification | null> {
  if (!type) return null;

  const token = type === "nanoid" ? nanoid() : uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db
    .delete(verification)
    .where(
      or(
        eq(verification.identifier, email),
        eq(verification.identifier, tokenIdentifier(purpose, email)),
      ),
    );

  return createVerificationToken(email, purpose, token, expiresAt);
}
