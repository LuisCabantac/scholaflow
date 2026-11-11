export function defaultAvatarUrl(): string {
  const base = process.env.VITE_SUPABASE_URL;

  if (!base) {
    throw new Error("VITE_SUPABASE_URL must be set");
  }

  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/avatars/default-avatar.jpg`;
}
