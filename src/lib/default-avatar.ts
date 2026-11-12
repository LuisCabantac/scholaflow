export const DEFAULT_AVATAR_FILE = "default-avatar.jpg";

const defaultAvatarPattern = /\/avatars\/\/?default-avatar\.jpg$/;
const googleAvatarPrefix = "https://lh3.googleusercontent.com/";

export function defaultAvatarUrl(): string {
  const base = process.env.VITE_SUPABASE_URL;

  if (!base) {
    throw new Error("VITE_SUPABASE_URL must be set");
  }

  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/avatars/${DEFAULT_AVATAR_FILE}`;
}

export function isDefaultAvatarUrl(url: string | null | undefined): boolean {
  return typeof url === "string" && defaultAvatarPattern.test(url);
}

export function isUploadedAvatarUrl(url: string | null | undefined): boolean {
  return (
    typeof url === "string" &&
    url.length > 0 &&
    !url.startsWith(googleAvatarPrefix) &&
    !isDefaultAvatarUrl(url)
  );
}

export function resolveAvatarSrc(
  src: string | null | undefined,
  failedSrc: string | null = null,
): string | null {
  if (!src || isDefaultAvatarUrl(src) || src === failedSrc) return null;
  return src;
}
