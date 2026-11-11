const safePath = /^\/(?!\/)[^\\\r\n]*$/;

export function isSafeRedirectPath(value: string | undefined): value is string {
  if (!value || !safePath.test(value)) return false;

  const beforeQuery = value.split(/[?#]/)[0] ?? "";
  if (beforeQuery.includes("@")) return false;

  const base = "https://scholaflow.invalid";
  try {
    return new URL(value, base).origin === base;
  } catch {
    return false;
  }
}

export function resolveRedirect(value: string | undefined): string {
  return isSafeRedirectPath(value) ? value : "/classroom";
}
