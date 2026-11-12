export function allowedOrigins(
  env = process.env.API_ALLOWED_ORIGINS,
): string[] {
  return (env ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function corsHeaders(
  request: Request,
  origins = allowedOrigins(),
): Headers {
  const headers = new Headers();
  const origin = request.headers.get("origin");
  if (!origin || !origins.includes(origin)) return headers;

  headers.set("access-control-allow-origin", origin);
  headers.set("vary", "origin");
  headers.set(
    "access-control-allow-methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  );
  headers.set("access-control-allow-headers", "authorization, content-type");
  headers.set("access-control-max-age", "600");
  return headers;
}
