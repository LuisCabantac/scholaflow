const safePath = /^\/(?!\/)[^\\\r\n]*$/;

export function isSafeRedirectPath(value: string | undefined): value is string {
  if (!value || !safePath.test(value)) return false;

  const beforeQuery = value.split(/[?#]/)[0] ?? "";

  return !beforeQuery.includes("@");
}

export function resolveRedirect(value: string | undefined): string {
  return isSafeRedirectPath(value) ? value : "/classroom";
}
