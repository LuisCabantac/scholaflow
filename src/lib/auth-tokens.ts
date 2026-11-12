import { nanoidId, uuidv4Id } from "@/lib/schema";
import type { TokenPurpose, TokenType } from "@/types/auth";

export function isExpired(
  expiresAt: Date | string,
  now: Date = new Date(),
): boolean {
  return new Date(expiresAt).getTime() < now.getTime();
}

export function matchesTokenType(value: string, type: TokenType): boolean {
  const schema = type === "nanoid" ? nanoidId : uuidv4Id;
  return schema.safeParse(value).success;
}

export function buildAppUrl(path: string): string {
  const base = process.env.APP_URL;

  if (!base) {
    throw new Error("APP_URL must be set");
  }

  return `${base.replace(/\/+$/, "")}${path}`;
}

const tokenPurposes: TokenPurpose[] = ["verify", "reset", "close"];

export function tokenIdentifier(purpose: TokenPurpose, email: string): string {
  return `${purpose}:${email}`;
}

export function parseTokenIdentifier(
  identifier: string,
): { purpose: TokenPurpose; email: string } | null {
  const separator = identifier.indexOf(":");
  if (separator === -1) return null;

  const purpose = identifier.slice(0, separator) as TokenPurpose;
  const email = identifier.slice(separator + 1);
  if (!tokenPurposes.includes(purpose) || !email) return null;

  return { purpose, email };
}
