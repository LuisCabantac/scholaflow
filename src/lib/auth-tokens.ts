import type { TokenType } from "@/types/auth";
import { nanoidId, uuidv4Id } from "@/lib/schema";

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
