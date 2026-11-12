import { format } from "date-fns";

import type {
  PasswordChangeError,
  PasswordChangeFields,
} from "@/types/profile";

export const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
export const AVATAR_ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 20;

export function isAvatarTooLarge(file: { size: number }): boolean {
  return file.size > MAX_AVATAR_BYTES;
}

export function isAvatarFile(file: { type: string; size: number }): boolean {
  return file.type.startsWith("image/") && file.size > 0;
}

export function passwordChangeError(
  fields: PasswordChangeFields,
  providerId: string,
): PasswordChangeError | null {
  const { currentPassword, newPassword, confirmNewPassword } = fields;

  if (!newPassword) return null;
  if (newPassword !== confirmNewPassword) return "mismatch";
  if (newPassword.length < MIN_PASSWORD_LENGTH) return "tooShort";
  if (newPassword.length > MAX_PASSWORD_LENGTH) return "tooLong";
  if (providerId === "credential" && !currentPassword) {
    return "currentRequired";
  }

  return null;
}

export function pickPasswordAccount<T extends { providerId: string }>(
  accounts: T[],
): T | null {
  return (
    accounts.find((account) => account.providerId === "credential") ??
    accounts[0] ??
    null
  );
}

export function joinedDate(date: Date | string): string {
  return format(date, "MMMM dd, yyyy");
}
