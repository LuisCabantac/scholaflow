import { auth } from "@/lib/auth";
import { ApiError } from "@/server/api/errors";
import type { SessionUser } from "@/types/auth";
import { getUserByUserId } from "@/services/user";

export function readBearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;

  const [scheme, ...rest] = header.trim().split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== "bearer") return null;

  const token = rest.join(" ").trim();
  return token.length ? token : null;
}

async function sessionUser(request: Request): Promise<SessionUser | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user ?? null;
  } catch {
    return null;
  }
}

async function jwtUser(token: string): Promise<SessionUser | null> {
  try {
    const result = await auth.api.verifyJWT({ body: { token } });
    const subject = result?.payload?.sub;
    if (!subject) return null;

    const user = await getUserByUserId(subject);
    return user ? (user as unknown as SessionUser) : null;
  } catch {
    return null;
  }
}

export async function requireApiUser(request: Request): Promise<SessionUser> {
  const token = readBearer(request);
  if (!token) throw new ApiError("unauthorized", "Authentication required.");

  const user = (await sessionUser(request)) ?? (await jwtUser(token));
  if (!user) throw new ApiError("unauthorized", "Invalid or expired token.");

  return user;
}
